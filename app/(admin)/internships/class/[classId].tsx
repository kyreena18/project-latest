import { downloadFileWithFallback } from '@/lib/utils';
import * as XLSX from 'xlsx';
import * as WebBrowser from 'expo-web-browser';
import { createAndDownloadZip } from '@/lib/utils';

interface StudentProfile {

  const downloadAllDocuments = async (assignmentType: string) => {
    let assignment;
    try {
      setDownloading(assignmentType);
      
      assignment = STATIC_ASSIGNMENTS.find(a => a.type === assignmentType);
      if (!assignment) return;

      // Collect all files for this assignment type
      const files: { url: string; studentName: string; rollNo: string; documentType: string }[] = [];
      
      profiles.forEach(profile => {
        const submission = getStudentSubmission(profile.student_id, assignmentType);
        if (submission?.file_url) {
          files.push({
            url: submission.file_url,
            studentName: profile.full_name,
            rollNo: profile.roll_no,
            documentType: assignmentType
          });
        }
      });

      if (files.length === 0) {
        Alert.alert('No Documents', `No ${assignment.title} documents found to download.`);
        return;
      }

      // Create ZIP file with all documents
      const zipFileName = `${classId}_${assignment.type}_${new Date().toISOString().split('T')[0]}.zip`;
      
      const success = await createAndDownloadZip(files, zipFileName);
      
      if (success) {
        Alert.alert('Success', `ZIP file with ${files.length} ${assignment.title} documents ready for download!`);
      } else {
        Alert.alert('Error', `Failed to create ZIP file with ${assignment.title} documents.`);
      }
    } catch (error) {
      console.error('ZIP download error:', error);
      Alert.alert('Error', `Failed to create ZIP file with ${assignment?.title} documents.`);
    } finally {
      setDownloading(null);
    }
  };
}