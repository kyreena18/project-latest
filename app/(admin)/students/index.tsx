import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Users, GraduationCap, ChevronRight, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ClassStats {
  className: string;
  displayName: string;
  description: string;
  studentCount: number;
  color: string;
}

export default function AdminStudentsScreen() {
  const router = useRouter();
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    loadClassStats();
  }, []);

  const loadClassStats = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        // Mock data for development
        const classDefinitions = [
          { className: 'TYIT', displayName: 'Third Year IT', description: 'Information Technology - Final Year', color: '#007AFF' },
          { className: 'TYSD', displayName: 'Third Year Software Development', description: 'Software Development - Final Year', color: '#34C759' },
          { className: 'SYIT', displayName: 'Second Year IT', description: 'Information Technology - Second Year', color: '#FF9500' },
          { className: 'SYSD', displayName: 'Second Year Software Development', description: 'Software Development - Second Year', color: '#AF52DE' }
        ];
        const mockStats = classDefinitions.map(def => ({ ...def, studentCount: def.className.startsWith('TY') ? 25 : 28 }));
        
        setClassStats(mockStats);
        setTotalStudents(mockStats.reduce((sum, cls) => sum + cls.studentCount, 0));
        setLoading(false);
        return;
      }

      // Real Supabase query
      const { data, error } = await supabase
        .from('student_profiles')
        .select('class')
        .not('class', 'is', null);

      if (error) throw error;

      // Count students by class
      const classCounts = (data || []).reduce((acc: { [key: string]: number }, student) => {
        const className = student.class;
        acc[className] = (acc[className] || 0) + 1;
        return acc;
      }, {});

      const classDefinitions = [
        { className: 'TYIT', displayName: 'Third Year IT', description: 'Information Technology - Final Year', color: '#007AFF' },
        { className: 'TYSD', displayName: 'Third Year Software Development', description: 'Software Development - Final Year', color: '#34C759' },
        { className: 'SYIT', displayName: 'Second Year IT', description: 'Information Technology - Second Year', color: '#FF9500' },
        { className: 'SYSD', displayName: 'Second Year Software Development', description: 'Software Development - Second Year', color: '#AF52DE' }
      ];

      const statsWithCounts = classDefinitions.map(classDef => ({
        ...classDef,
        studentCount: classCounts[classDef.className] || 0
      }));

      setClassStats(statsWithCounts);
      setTotalStudents(Object.values(classCounts).reduce((sum: number, count: number) => sum + count, 0));
    } catch (error) {
      console.error('Error loading class stats:', error);
      setClassStats([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToClass = (className: string) => {
    router.push(`/(admin)/students/class/${className}`);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Management</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bulkImportButton}
            onPress={() => router.push('/(admin)/students/bulk-import')}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.bulkImportText}>Import</Text>
          </TouchableOpacity>
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>{totalStudents} Total</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Users size={32} color="#007AFF" />
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewTitle}>Student Overview</Text>
              <Text style={styles.overviewSubtitle}>
                Manage students across all classes
              </Text>
            </View>
          </View>
          <View style={styles.overviewStats}>
            <Text style={styles.totalStudents}>{totalStudents}</Text>
            <Text style={styles.totalLabel}>Total Students</Text>
          </View>
        </View>

        <View style={styles.classesSection}>
          <Text style={styles.sectionTitle}>Classes</Text>
          <Text style={styles.sectionSubtitle}>
            Select a class to view and manage students
          </Text>

          <View style={styles.classesList}>
            {classStats.map((classItem) => (
              <View key={classItem.className} style={styles.classCard}>
                <View style={styles.classHeader}>
                  <View style={[styles.classIcon, { backgroundColor: classItem.color }]}>
                    <GraduationCap size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.className}</Text>
                    <Text style={styles.classDisplayName}>{classItem.displayName}</Text>
                    <Text style={styles.classDescription}>{classItem.description}</Text>
                  </View>
                  <View style={styles.classStats}>
                    <Text style={styles.studentCount}>{classItem.studentCount}</Text>
                    <Text style={styles.studentLabel}>Students</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewStudentsButton}
                  onPress={() => navigateToClass(classItem.className)}
                >
                  <Text style={styles.viewStudentsText}>View Students</Text>
                  <ChevronRight size={16} color="#007AFF" />
                </TouchableOpacity>
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
    paddingTop: screenHeight * 0.07,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight * 0.025,
  },
  headerTitle: {
    fontSize: Math.max(screenWidth * 0.06, 20),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulkImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  bulkImportText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: screenWidth * 0.03,
    paddingHorizontal: screenWidth * 0.03,
    paddingVertical: screenHeight * 0.008,
  },
  headerStatsText: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Math.max(screenWidth * 0.04, 14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: screenWidth * 0.05,
    padding: screenWidth * 0.06,
    marginBottom: screenHeight * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.025,
  },
  overviewInfo: {
    marginLeft: screenWidth * 0.04,
    flex: 1,
  },
  overviewTitle: {
    fontSize: Math.max(screenWidth * 0.05, 18),
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: screenHeight * 0.005,
  },
  overviewSubtitle: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#6B6B6B',
  },
  overviewStats: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: screenWidth * 0.04,
    paddingVertical: screenHeight * 0.025,
  },
  totalStudents: {
    fontSize: Math.max(screenWidth * 0.09, 28),
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: screenHeight * 0.005,
  },
  totalLabel: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#6B6B6B',
    fontWeight: '500',
  },
  classesSection: {
    marginBottom: screenHeight * 0.05,
  },
  sectionTitle: {
    fontSize: Math.max(screenWidth * 0.05, 18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: screenHeight * 0.01,
  },
  sectionSubtitle: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: screenHeight * 0.02,
  },
  classesList: {
    gap: screenHeight * 0.025,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: screenWidth * 0.05,
    padding: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.02,
  },
  classIcon: {
    width: Math.max(screenWidth * 0.12, 40),
    height: Math.max(screenWidth * 0.12, 40),
    borderRadius: Math.max(screenWidth * 0.06, 20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: screenWidth * 0.04,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: Math.max(screenWidth * 0.045, 16),
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: screenHeight * 0.003,
  },
  classDisplayName: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: screenHeight * 0.003,
  },
  classDescription: {
    fontSize: Math.max(screenWidth * 0.03, 10),
    color: '#6B6B6B',
    flexWrap: 'wrap',
  },
  classStats: {
    alignItems: 'center',
  },
  studentCount: {
    fontSize: Math.max(screenWidth * 0.06, 20),
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: screenHeight * 0.003,
  },
  studentLabel: {
    fontSize: Math.max(screenWidth * 0.03, 10),
    color: '#6B6B6B',
  },
  viewStudentsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: screenWidth * 0.03,
    paddingHorizontal: screenWidth * 0.04,
    paddingVertical: screenHeight * 0.015,
    marginTop: screenHeight * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  viewStudentsText: {
    fontSize: Math.max(screenWidth * 0.04, 14),
    color: '#007AFF',
    fontWeight: '600',
  },
});