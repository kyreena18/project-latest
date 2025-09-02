import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Users, GraduationCap, ChevronRight, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Student {
  id: string;
  name: string;
  uid: string;
  roll_no: string;
  email: string;
  class: string;
}

interface ClassData {
  className: string;
  displayName: string;
  students: Student[];
  color: string;
}

export default function AdminStudentsScreen() {
  const router = useRouter();
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    loadStudentsByClass();
  }, []);

  const loadStudentsByClass = async () => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        // Mock data for development
        const mockClassData: ClassData[] = [
          {
            className: 'TYIT',
            displayName: 'Third Year IT',
            color: '#007AFF',
            students: [
              { id: '1', name: 'John Doe', uid: 'TYIT001', roll_no: '001', email: 'john@college.edu', class: 'TYIT' },
              { id: '2', name: 'Jane Smith', uid: 'TYIT002', roll_no: '002', email: 'jane@college.edu', class: 'TYIT' },
              { id: '3', name: 'Mike Johnson', uid: 'TYIT003', roll_no: '003', email: 'mike@college.edu', class: 'TYIT' },
            ]
          },
          {
            className: 'TYSD',
            displayName: 'Third Year Software Development',
            color: '#34C759',
            students: [
              { id: '4', name: 'Sarah Wilson', uid: 'TYSD001', roll_no: '001', email: 'sarah@college.edu', class: 'TYSD' },
              { id: '5', name: 'David Brown', uid: 'TYSD002', roll_no: '002', email: 'david@college.edu', class: 'TYSD' },
            ]
          },
          {
            className: 'SYIT',
            displayName: 'Second Year IT',
            color: '#FF9500',
            students: [
              { id: '6', name: 'Emily Davis', uid: 'SYIT001', roll_no: '001', email: 'emily@college.edu', class: 'SYIT' },
              { id: '7', name: 'Chris Miller', uid: 'SYIT002', roll_no: '002', email: 'chris@college.edu', class: 'SYIT' },
            ]
          },
          {
            className: 'SYSD',
            displayName: 'Second Year Software Development',
            color: '#AF52DE',
            students: [
              { id: '8', name: 'Lisa Garcia', uid: 'SYSD001', roll_no: '001', email: 'lisa@college.edu', class: 'SYSD' },
            ]
          }
        ];
        
        setClassData(mockClassData);
        setTotalStudents(mockClassData.reduce((sum, cls) => sum + cls.students.length, 0));
        setLoading(false);
        return;
      }

      // Real Supabase query
      const { data, error } = await supabase
        .from('students')
        .select('id, name, uid, roll_no, email, class')
        .order('class')
        .order('roll_no');

      if (error) throw error;

      // Group students by class
      const studentsByClass: { [key: string]: Student[] } = {};
      (data || []).forEach(student => {
        if (!studentsByClass[student.class]) {
          studentsByClass[student.class] = [];
        }
        studentsByClass[student.class].push(student);
      });

      const classDefinitions = [
        { className: 'TYIT', displayName: 'Third Year IT', color: '#007AFF' },
        { className: 'TYSD', displayName: 'Third Year Software Development', color: '#34C759' },
        { className: 'SYIT', displayName: 'Second Year IT', color: '#FF9500' },
        { className: 'SYSD', displayName: 'Second Year Software Development', color: '#AF52DE' }
      ];

      const organizedData = classDefinitions.map(classDef => ({
        ...classDef,
        students: studentsByClass[classDef.className] || []
      }));

      setClassData(organizedData);
      setTotalStudents((data || []).length);
    } catch (error) {
      console.error('Error loading students:', error);
      setClassData([]);
    } finally {
      setLoading(false);
    }
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
        {classData.map((classItem) => (
          <View key={classItem.className} style={styles.classSection}>
            <View style={styles.classHeader}>
              <View style={[styles.classIcon, { backgroundColor: classItem.color }]}>
                <GraduationCap size={20} color="#FFFFFF" />
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classItem.className}</Text>
                <Text style={styles.classDisplayName}>{classItem.displayName}</Text>
              </View>
              <View style={styles.classStats}>
                <Text style={styles.studentCount}>{classItem.students.length}</Text>
                <Text style={styles.studentLabel}>Students</Text>
              </View>
            </View>

            {classItem.students.length === 0 ? (
              <View style={styles.emptyClass}>
                <Text style={styles.emptyText}>No students in this class</Text>
              </View>
            ) : (
              <View style={styles.studentsList}>
                {classItem.students.map((student) => (
                  <View key={student.id} style={styles.studentCard}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentDetails}>
                        UID: {student.uid} • Roll: {student.roll_no}
                      </Text>
                      <Text style={styles.studentEmail}>{student.email}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
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
  classSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  classIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    color: '#6B6B6B',
  },
  classStats: {
    alignItems: 'center',
  },
  studentCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  studentLabel: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  emptyClass: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  studentsList: {
    padding: 16,
    gap: 12,
  },
  studentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  studentInfo: {
    gap: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  studentDetails: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  studentEmail: {
    fontSize: 14,
    color: '#007AFF',
  },
});