@@ .. @@
 import * as XLSX from 'xlsx';
 import { formatDate, getStatusColor, downloadFileWithFallback } from '@/lib/utils';
 import * as WebBrowser from 'expo-web-browser';
+import { createAndDownloadZip } from '@/lib/utils';

 interface PlacementEvent {
@@ .. @@
   // Prepare and download offer letters links as a text file
   const downloadPlacementDocuments = async (event: PlacementEvent) => {
     try {
       setDownloading(`offers_${event.id}`);

       // Load applications for this specific event
       const apps = await loadEventApplications(event.id);

       const acceptedWithOfferLetters = (apps || []).filter(app =>
         app.application_status === 'accepted' && app.offer_letter_url
       );

       if (acceptedWithOfferLetters.length === 0) {
         const accepted = (apps || []).filter(app => app.application_status === 'accepted');
         if (accepted.length === 0) {
           Alert.alert('No Documents', 'No offer letters found for accepted students.');
           return;
         }
-        const offerLettersList = accepted.map((app, index) =>
-          `${index + 1}. ${app.students?.student_profiles?.full_name || app.students?.name}\n` +
-          `   UID: ${app.students?.uid}\n` +
-          `   Offer Letter: ${app.offer_letter_url || 'Not uploaded'}\n`
-        ).join('\n');
-
-        const content = `${event.company_name} - ${event.title}\n` +
-                        `Offer Letter Links for Accepted Students (some may be missing)\n` +
-                        `Generated: ${new Date().toLocaleDateString()}\n` +
-                        `Total Accepted: ${accepted.length}\n\n` +
-                        offerLettersList;
-
-        const filename = `${event.company_name}_offer_letters_${new Date().toISOString().split('T')[0]}.txt`;
-        const success = await saveAndShareText(content, filename);
-        if (success) {
-          Alert.alert('Links Ready', 'Offer letter links have been prepared for download.');
-        }
+        Alert.alert('Missing Documents', 'Some accepted students have not uploaded their offer letters yet.');
         return;
       }

-      const
} offerLettersList = acceptedWithOfferLetters.map((app, index) =>
-        `${index + 1}. ${app.students?.student_profiles?.full_name || app.students?.name}\n` +
-        `   UID: ${app.students?.uid}\n` +
-        `   Offer Letter: ${app.offer_letter_url}\n`
-      ).join('\n');
-
-      const content = `${event.company_name} - ${event.title}\n` +
-                      `Offer Letters for Accepted Students\n` +
-                      `Generated: ${new Date().toLocaleDateString()}\n` +
-                      `Total Offer Letters: ${acceptedWithOfferLetters.length}\n\n` +
-                      offerLettersList;
-
-      const filename = `${event.company_name}_offer_letters_${new Date().toISOString().split('T')[0]}.txt`;
-
-      const success = await downloadFileWithFallback(content, filename, 'text/plain');
+      // Prepare files for ZIP download
+      const files = acceptedWithOfferLetters.map(app => ({
+        url: app.offer_letter_url!,
+        studentName: app.students?.student_profiles?.full_name || app.students?.name || 'Unknown',
+        rollNo: app.students?.roll_no || app.students?.uid || 'Unknown',
+        documentType: 'offer_letter'
+      }));
+
+      const zipFileName = `${event.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Offer_Letters_${new Date().toISOString().split('T')[0]}.zip`;
+      
+      const success = await createAndDownloadZip(files, zipFileName);

       if (success) {
-        Alert.alert('Success', `Offer letter links prepared for ${acceptedWithOfferLetters.length} students.`);
+        Alert.alert('Success', `ZIP file with ${acceptedWithOfferLetters.length} offer letters ready for download!`);
       } else {
-        Alert.alert('Error', 'Failed to prepare offer letters list.');
+        Alert.alert('Error', 'Failed to create ZIP file with offer letters.');
       }
     } catch (error) {
-      console.error('Bulk download error:', error);
-      Alert.alert('Error', 'Failed to download offer letters.');
+      console.error('ZIP download error:', error);
+      Alert.alert('Error', 'Failed to create ZIP file with offer letters.');
     } finally {
       setDownloading(null);
     }
   };