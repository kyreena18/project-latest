import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GraduationCap, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

interface ClassStats {
  className: string;
  displayName: string;
  description: string;
  studentCount: number;
  color: string;
}

export default function AdminInternshipsScreen() {
  const router = useRouter();
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadClassStats();
  }, []);

  const loadClassStats = async () => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        // Mock data for development
        const classDefinitions = [
          { className: 'TYIT', displayName: 'Third Year IT', description: 'Information Technology - Final Year', color: '#007AFF' },
          { className: 'TYSD', displayName: 'Third Year Software Development', description: 'Software Development - Final Year', color: '#34C759' },
          { className: 'SYIT', displayName: 'Second Year IT', description: 'Information Technology - Second Year', color: '#FF9500' },
          { className: 'SYSD', displayName: 'Second Year Software Development', description: 'Software Development - Second Year', color: '#AF52DE' }
        ];
        const mockStats = classDefinitions.map(def => ({ ...def, studentCount: def.className.startsWith('TY') ? 25 : 22 }));
        
        setClassStats(mockStats);
        setTotalStudents(mockStats.reduce((sum, cls) => sum + cls.studentCount, 0));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('student_profiles')
        .select('class')
        .not('class', 'is', null);

      if (error) throw error;

      const classCounts = (data || []).reduce((acc: { [key: string]: number }, student: any) => {
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
    router.push(`/(admin)/internships/class/${className}`);
  };

  // Helper: export classStats to Excel and save/share
  const exportClassStatsToExcel = async () => {
    if (classStats.length === 0) {
      Alert.alert('No data', 'No class stats to export.');
      return;
    }
    try {
      setExporting(true);
      const exportData = classStats.map((c, idx) => ({
        'S.No': idx + 1,
        'Class Code': c.className,
        'Display Name': c.displayName,
        'Description': c.description,
        'Student Count': c.studentCount,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'ClassStats');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Internships_ClassStats_${timestamp}.xlsx`;

      await saveAndShareBase64(wbout, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (err) {
      console.error('Excel generation error (internships):', err);
      Alert.alert('Export Failed', 'Could not generate Excel file.');
    } finally {
      setExporting(false);
    }
  };

  // Utility: save & share base64 data (works on mobile and web)
  const saveAndShareBase64 = async (base64Data: string, filename: string, mime: string) => {
    try {
      if (Platform.OS === 'web') {
        // Web fallback: create anchor with data URL
        const link = document.createElement('a');
        link.href = `data:${mime};base64,${base64Data}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      // Sharing
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: mime, dialogTitle: 'Share Excel file' });
      } else {
        Alert.alert('Saved', `File saved to ${fileUri}`);
      }
    } catch (err) {
      console.error('saveAndShareBase64 error:', err);
      Alert.alert('Error', 'Failed to save or share file.');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading internship data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Internship Management</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>{totalStudents} Students</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <GraduationCap size={32} color="#007AFF" />
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewTitle}>Internship Overview</Text>
              <Text style={styles.overviewSubtitle}>
                Manage student internship submissions across all classes
              </Text>
            </View>
          </View>
          <View style={styles.overviewStats}>
            <Text style={styles.totalStudents}>{totalStudents}</Text>
            <Text style={styles.totalLabel}>Total Students</Text>
          </View>
        </View>

        <View style={styles.assignmentsInfo}>
          <Text style={styles.sectionTitle}>Static Assignments</Text>
          <Text style={styles.sectionSubtitle}>
            All students have access to these 6 predefined assignments
          </Text>
          
          <View style={styles.assignmentsList}>
            <View style={styles.assignmentItem}>
              <Text style={styles.assignmentName}>1. Offer Letter</Text>
              <Text style={styles.assignmentDesc}>Must be approved to unlock others</Text>
            </View>
            <View style={styles.assignmentItem}>
              <Text style={styles.assignmentName}>2. Completion Letter</Text>
              <Text style={styles.assignmentDesc}>Internship completion certificate</Text>
            </View>
            <View style={styles.assignmentItem}>
              <Text style={styles.assignmentName}>3. Weekly Report</Text>
              <Text style={styles.assignmentDesc}>Weekly progress reports</Text>
            </View>
            <View style={styles.assignmentItem}>
              <Text style={styles.assignmentName}>4. Student Outcome</Text>
              <Text style={styles.assignmentDesc}>Student outcome assessment</Text>
            </View>
            <View style={styles.assignmentItem}>
              <Text style={styles.assignmentName}>5. Student Feedback</Text>
              <Text style={styles.assignmentDesc}>Feedback about internship experience</Text>
            </View>
            <View style={styles.assignmentItem}>
              <Text style={styles.assignmentName}>6. Company Outcome</Text>
              <Text style={styles.assignmentDesc}>Company evaluation report</Text>
            </View>
          </View>
        </View>

        <View style={styles.classesSection}>
          <Text style={styles.sectionTitle}>Classes</Text>
          <Text style={styles.sectionSubtitle}>
            Select a class to view and manage student submissions
          </Text>

          <View style={styles.classesList}>
            {classStats.map((classItem) => (
              <TouchableOpacity
                key={classItem.className}
                style={styles.classCard}
                onPress={() => navigateToClass(classItem.className)}
              >
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
                <View style={styles.classFooter}>
                  <Text style={styles.viewStudentsText}>View Student Submissions</Text>
                  <ChevronRight size={16} color="#007AFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createEventButton, exporting && styles.disabledButton]}
          onPress={exportClassStatsToExcel}
          disabled={exporting}
        >
          <Text style={styles.createEventButtonText}>{exporting ? 'Exporting...' : 'Export Class Stats (Excel)'}</Text>
        </TouchableOpacity>
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
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewInfo: {
    marginLeft: 16,
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  overviewStats: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 20,
  },
  totalStudents: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  assignmentsInfo: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  assignmentsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  assignmentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  assignmentDesc: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  classesSection: {
    marginBottom: 40,
  },
  classesList: {
    gap: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  classDisplayName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  classDescription: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  classStats: {
    alignItems: 'center',
  },
  studentCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  studentLabel: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  viewStudentsText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});