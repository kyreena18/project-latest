import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, User, Hash, FileText, Download } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { downloadFile } from '@/lib/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Student {
  id: string;
  name: string;
  uid: string;
  roll_no: string;
  email: string;
  class: string;
}

export default function ClassStudentsView() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [classId]);

  const loadStudents = async () => {
    if (!classId) return;
    
    try {
      setLoading(true);

      // Check if Supabase is configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        // Mock data for development
        const mockStudents: Student[] = [];
        const studentCount = String(classId).startsWith('TY') ? 25 : 22;
        
        for (let i = 1; i <= studentCount; i++) {
          const rollNo = `${i.toString().padStart(3, '0')}`;
          mockStudents.push({
            id: `mock-student-${classId}-${i}`,
            name: `Student ${i} Full Name`,
            uid: `${classId}${rollNo}`,
            roll_no: rollNo,
            email: `student${i}@college.edu`,
            class: String(classId),
          });
        }

        // Sort by roll number
        mockStudents.sort((a, b) => {
          const rollA = parseInt(a.roll_no) || 0;
          const rollB = parseInt(b.roll_no) || 0;
          return rollA - rollB;
        });
        setStudents(mockStudents);
        setLoading(false);
        return;
      }

      // Real Supabase query
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          id,
          student_id,
          full_name,
          uid,
          roll_no,
          class,
          students!inner(
            name,
            email
          )
        `)
        .eq('class', String(classId))
        .order('roll_no');

      if (error) {
        console.error('Error loading students:', error);
        setStudents([]);
      } else {
        // Transform the data to match the Student interface
        const transformedData = (data || []).map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.students?.name || 'Unknown',
          uid: profile.uid,
          roll_no: profile.roll_no,
          email: profile.students?.email || '',
          class: profile.class,
        }));
        
        // Sort by roll number
        transformedData.sort((a, b) => {
          const rollA = parseInt(a.roll_no) || 0;
          const rollB = parseInt(b.roll_no) || 0;
          return rollA - rollB;
        });
        setStudents(transformedData);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const data = students.map((student, index) => ({
        'S.No': index + 1,
        'Name': student.name,
        'UID': student.uid,
        'Roll Number': student.roll_no,
        'Class': student.class,
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      const colWidths = [
        { wch: 6 },  // S.No
        { wch: 25 }, // Name
        { wch: 15 }, // UID
        { wch: 15 }, // Roll Number
        { wch: 8 },  // Class
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${classId} Students`);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${classId}_Students_${timestamp}.xlsx`;
      
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      
      const success = await downloadFile(wbout, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      if (success) {
        Alert.alert('Success', `Excel report for ${classId} ready for download!`);
      } else {
        Alert.alert('Report Ready', 'Excel report has been prepared for download.');
      }
    } catch (error) {
      console.error('Excel generation error:', error);
      Alert.alert('Error', 'Failed to generate Excel report');
    }
  };

  const getClassDisplayName = (className: string) => {
    const classNames: { [key: string]: string } = {
      'TYIT': 'Third Year Information Technology',
      'TYSD': 'Third Year Software Development',
      'SYIT': 'Second Year Information Technology',
      'SYSD': 'Second Year Software Development',
    };
    return classNames[className] || className;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={Math.max(screenWidth * 0.05, 18)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class: {String(classId)}</Text>
          <View style={{ width: Math.max(screenWidth * 0.09, 32) }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={Math.max(screenWidth * 0.05, 18)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class: {String(classId)}</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
          <Download size={Math.max(screenWidth * 0.04, 14)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.classInfo}>
        <Text style={styles.classDisplayName}>{getClassDisplayName(String(classId))}</Text>
        <Text style={styles.studentCountText}>{students.length} Students</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={Math.max(screenWidth * 0.16, 56)} color="#6B6B6B" />
            <Text style={styles.emptyStateTitle}>No Students Found</Text>
            <Text style={styles.emptyStateText}>
              No students are registered in {String(classId)} class yet.
            </Text>
          </View>
        ) : (
          <View style={styles.studentsList}>
            {students.map((student, index) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <View style={styles.studentDetails}>
                      <View style={styles.detailRow}>
                        <Hash size={Math.max(screenWidth * 0.035, 12)} color="#6B6B6B" />
                        <Text style={styles.detailText}>UID: {student.uid}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <FileText size={Math.max(screenWidth * 0.035, 12)} color="#6B6B6B" />
                        <Text style={styles.detailText}>Roll: {student.roll_no}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: screenHeight * 0.07,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight * 0.025,
  },
  backButton: {
    width: Math.max(screenWidth * 0.09, 32),
    height: Math.max(screenWidth * 0.09, 32),
    borderRadius: Math.max(screenWidth * 0.045, 16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  headerTitle: {
    fontSize: Math.max(screenWidth * 0.05, 18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exportButton: {
    width: Math.max(screenWidth * 0.09, 32),
    height: Math.max(screenWidth * 0.09, 32),
    borderRadius: Math.max(screenWidth * 0.045, 16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
  },
  classInfo: {
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight * 0.025,
  },
  classDisplayName: {
    fontSize: Math.max(screenWidth * 0.045, 16),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: screenHeight * 0.005,
  },
  studentCountText: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.05,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Math.max(screenWidth * 0.04, 14),
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: screenHeight * 0.08,
    backgroundColor: '#FFFFFF',
    borderRadius: screenWidth * 0.05,
    margin: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyStateTitle: {
    fontSize: Math.max(screenWidth * 0.05, 18),
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: screenHeight * 0.02,
    marginBottom: screenHeight * 0.01,
  },
  emptyStateText: {
    fontSize: Math.max(screenWidth * 0.04, 14),
    color: '#6B6B6B',
    textAlign: 'center',
    paddingHorizontal: screenWidth * 0.05,
  },
  studentsList: {
    gap: screenHeight * 0.015,
    paddingBottom: screenHeight * 0.05,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: screenWidth * 0.04,
    padding: screenWidth * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: Math.max(screenWidth * 0.12, 40),
    height: Math.max(screenWidth * 0.12, 40),
    borderRadius: Math.max(screenWidth * 0.06, 20),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: screenWidth * 0.04,
  },
  studentAvatarText: {
    fontSize: Math.max(screenWidth * 0.04, 14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: Math.max(screenWidth * 0.045, 16),
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: screenHeight * 0.01,
    flexWrap: 'wrap',
    lineHeight: Math.max(screenWidth * 0.05, 18),
  },
  studentDetails: {
    gap: screenHeight * 0.005,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: screenWidth * 0.02,
  },
  detailText: {
    fontSize: Math.max(screenWidth * 0.035, 12),
    color: '#6B6B6B',
    flexWrap: 'wrap',
    flex: 1,
  },
});