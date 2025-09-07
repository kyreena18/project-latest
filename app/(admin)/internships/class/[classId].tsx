@@ .. @@
 import { downloadFileWithFallback } from '@/lib/utils';
 import * as XLSX from 'xlsx';
 import * as WebBrowser from 'expo-web-browser';
+import { createAndDownloadZip } from '@/lib/utils';

 interface StudentProfile {
@@ .. @@
   const downloadAllDocuments = async (assignmentType: string) => {
     let assignment;
     try {
       setDownloading(assignmentType);
       
       assignment = STATIC_ASSIGNMENTS.find(a => a.type === assignmentType);
       if (!assignment) return;

-      // Collect all file URLs for this assignment type
-      const fileUrls: { url: string; studentName: string; rollNo: string }[] = [];
+      // Collect all files for this assignment type
+      const files: { url: string; studentName: string; rollNo: string; documentType: string }[] = [];
       
       profiles.forEach(profile => {
         const submission = getStudentSubmission(profile.student_id, assignmentType);
         if (submission?.file_url) {
-          fileUrls.push({
+          files.push({
             url: submission.file_url,
             studentName: profile.full_name,
-            rollNo: profile.roll_no
+            rollNo: profile.roll_no,
+            documentType: assignmentType
           });
         }
       });

-      if (fileUrls.length === 0) {
+      if (files.length === 0) {
         Alert.alert('No Documents', `No ${assignment.title} documents found to download.`);
         return;
       }

-      // Create a simple text file with all document links for mobile sharing
-      const documentsList = fileUrls.map((file, index) => 
-        `${index + 1}. ${file.studentName} (${file.rollNo})\n   ${file.url}\n`
-      ).join('\n');
-      
-      const content = `${assignment.title} Documents\n` +
-                     `Class: ${classId}\n` +
-                     `Generated: ${new Date().toLocaleDateString()}\n` +
-                     `Total Documents: ${fileUrls.length}\n\n` +
-                     documentsList;
-      
-      const filename = `${classId}_${assignment.type}_links_${new Date().toISOString().split('T')[0]}.txt`;
-      
-      const success = await downloadFileWithFallback(content, filename, 'text/plain');
+      // Create ZIP file with all documents
+      const zipFileName = `${classId}_${assignment.type}_${new Date().toISOString().split('T')[0]}.zip`;
+      
+      const success = await createAndDownloadZip(files, zipFileName);
       
       if (success) {
-        Alert.alert('Success', `Document links shared! You can now access all ${fileUrls.length} documents.`);
+        Alert.alert('Success', `ZIP file with ${files.length} ${assignment.title} documents ready for download!`);
       } else {
-        Alert.alert('Links Ready', 'Document links have been prepared for download.');
+        Alert.alert('Error', `Failed to create ZIP file with ${assignment.title} documents.`);
       }
     } catch (error) {
-      console.error('Bulk download error:', error);
-      Alert.alert('Error', `Failed to download ${assignment?.title} documents.`);
+      console.error('ZIP download error:', error);
+      Alert.alert('Error', `Failed to create ZIP file with ${assignment?.title} documents.`);
     } finally {
       setDownloading(null);
     }
   };