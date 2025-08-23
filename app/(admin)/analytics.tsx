import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartBar as BarChart3, Users, Building, TrendingUp, Award } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface PlacementStats {
  totalCompanies: number;
  totalApplications: number;
  totalAccepted: number;
  acceptanceRate: number;
  companiesData: CompanyData[];
  classWiseStats: ClassStats[];
}

interface CompanyData {
  company_name: string;
  total_applications: number;
  accepted_applications: number;
  acceptance_rate: number;
}

interface ClassStats {
  class: string;
  total_students: number;
  applied_students: number;
  accepted_students: number;
}

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<PlacementStats>({
    totalCompanies: 0,
    totalApplications: 0,
    totalAccepted: 0,
    acceptanceRate: 0,
    companiesData: [],
    classWiseStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time subscriptions for dynamic updates
    const setupRealtimeSubscriptions = () => {
      const applicationsChannel = supabase
        .channel('analytics-applications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'placement_applications',
          },
          () => {
            loadAnalyticsData();
          }
        )
        .subscribe();

      const eventsChannel = supabase
        .channel('analytics-events-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'placement_events',
          },
          () => {
            loadAnalyticsData();
          }
        )
        .subscribe();

      return () => {
        applicationsChannel.unsubscribe();
        eventsChannel.unsubscribe();
      };
    };

    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        // Mock data for development
        const mockStats: PlacementStats = {
          totalCompanies: 8,
          totalApplications: 156,
          totalAccepted: 42,
          acceptanceRate: 26.9,
          companiesData: [
            { company_name: 'Google', total_applications: 25, accepted_applications: 8, acceptance_rate: 32.0 },
            { company_name: 'Microsoft', total_applications: 22, accepted_applications: 6, acceptance_rate: 27.3 },
            { company_name: 'Amazon', total_applications: 28, accepted_applications: 7, acceptance_rate: 25.0 },
            { company_name: 'Meta', total_applications: 18, accepted_applications: 5, acceptance_rate: 27.8 },
            { company_name: 'Apple', total_applications: 15, accepted_applications: 4, acceptance_rate: 26.7 },
            { company_name: 'Netflix', total_applications: 12, accepted_applications: 3, acceptance_rate: 25.0 },
            { company_name: 'Tesla', total_applications: 20, accepted_applications: 5, acceptance_rate: 25.0 },
            { company_name: 'Spotify', total_applications: 16, accepted_applications: 4, acceptance_rate: 25.0 }
          ],
          classWiseStats: [
            { class: 'TYIT', total_students: 25, applied_students: 23, accepted_students: 18 },
            { class: 'TYSD', total_students: 22, applied_students: 20, accepted_students: 15 },
            { class: 'SYIT', total_students: 28, applied_students: 0, accepted_students: 0 },
            { class: 'SYSD', total_students: 24, applied_students: 0, accepted_students: 0 }
          ]
        };
        setStats(mockStats);
        setLoading(false);
        return;
      }

      // Real data queries
      const [companiesResult, applicationsResult, classStatsResult] = await Promise.all([
        // Get total companies
        supabase.from('placement_events').select('company_name').eq('is_active', true),
        
        // Get applications with company data
        supabase.from('placement_applications').select(`
          *,
          placement_events!inner(company_name)
        `),
        
        // Get class-wise stats
        supabase.from('student_profiles').select('class, student_id')
      ]);

      const companies = companiesResult.data || [];
      const applications = applicationsResult.data || [];
      const classProfiles = classStatsResult.data || [];

      // Calculate company-wise stats
      const companyStats: { [key: string]: { total: number; accepted: number } } = {};
      applications.forEach(app => {
        const companyName = app.placement_events.company_name;
        if (!companyStats[companyName]) {
          companyStats[companyName] = { total: 0, accepted: 0 };
        }
        companyStats[companyName].total++;
        if (app.application_status === 'accepted') {
          companyStats[companyName].accepted++;
        }
      });

      const companiesData: CompanyData[] = Object.entries(companyStats).map(([company, data]) => ({
        company_name: company,
        total_applications: data.total,
        accepted_applications: data.accepted,
        acceptance_rate: data.total > 0 ? (data.accepted / data.total) * 100 : 0
      }));

      // Calculate class-wise stats
      const classStats: { [key: string]: { total: number; applied: number; accepted: number } } = {};
      ['TYIT', 'TYSD', 'SYIT', 'SYSD'].forEach(className => {
        classStats[className] = { total: 0, applied: 0, accepted: 0 };
      });

      classProfiles.forEach(profile => {
        if (classStats[profile.class]) {
          classStats[profile.class].total++;
        }
      });

      applications.forEach(app => {
        // Get student class from applications
        const studentClass = 'TYIT'; // This would need to be joined properly
        if (classStats[studentClass]) {
          classStats[studentClass].applied++;
          if (app.application_status === 'accepted') {
            classStats[studentClass].accepted++;
          }
        }
      });

      const classWiseStats: ClassStats[] = Object.entries(classStats).map(([className, data]) => ({
        class: className,
        total_students: data.total,
        applied_students: data.applied,
        accepted_students: data.accepted
      }));

      const totalApplications = applications.length;
      const totalAccepted = applications.filter(app => app.application_status === 'accepted').length;

      setStats({
        totalCompanies: new Set(companies.map(c => c.company_name)).size,
        totalApplications,
        totalAccepted,
        acceptanceRate: totalApplications > 0 ? (totalAccepted / totalApplications) * 100 : 0,
        companiesData,
        classWiseStats
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Placement Analytics</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>2024-25</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.overviewCards}>
          <View style={styles.statCard}>
            <Building size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{stats.totalCompanies}</Text>
            <Text style={styles.statLabel}>Companies</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#34C759" />
            <Text style={styles.statNumber}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statCard}>
            <Award size={24} color="#FF9500" />
            <Text style={styles.statNumber}>{stats.totalAccepted}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#AF52DE" />
            <Text style={styles.statNumber}>{stats.acceptanceRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Company-wise Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Performance</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Company</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Applied</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Accepted</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rate</Text>
            </View>
            {stats.companiesData.map((company, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{company.company_name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{company.total_applications}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{company.accepted_applications}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{company.acceptance_rate.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Class-wise Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Class Performance</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Class</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Applied</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Placed</Text>
            </View>
            {stats.classWiseStats.map((classData, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{classData.class}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{classData.total_students}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{classData.applied_students}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{classData.accepted_students}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Simple Chart Representation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptance Rate Visualization</Text>
          <View style={styles.chartContainer}>
            {stats.companiesData.slice(0, 5).map((company, index) => (
              <View key={index} style={styles.chartBar}>
                <Text style={styles.chartLabel}>{company.company_name}</Text>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        width: `${company.acceptance_rate}%`,
                        backgroundColor: ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30'][index % 5]
                      }
                    ]} 
                  />
                  <Text style={styles.barText}>{company.acceptance_rate.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerStatsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  overviewCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  tableCell: {
    fontSize: 14,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  chartBar: {
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  barText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
});