@@ .. @@
 import { Platform } from 'react-native';
 import * as FileSystem from 'expo-file-system';
 import * as Sharing from 'expo-sharing';
+import JSZip from 'jszip';

 export const formatDate = (dateString: string) => {
@@ .. @@
   return buf;
 };

+// Helper function to download file as blob for ZIP creation
+export const downloadFileAsBlob = async (url: string): Promise<Blob | null> => {
+  try {
+    const response = await fetch(url);
+    if (!response.ok) {
+      console.warn(`Failed to download file from ${url}: ${response.status}`);
+      return null;
+    }
+    return await response.blob();
+  } catch (error) {
+    console.warn(`Error downloading file from ${url}:`, error);
+    return null;
+  }
+};
+
+// Helper function to get file extension from URL
+export const getFileExtensionFromUrl = (url: string): string => {
+  try {
+    const pathname = new URL(url).pathname;
+    const extension = pathname.split('.').pop()?.toLowerCase();
+    return extension || 'pdf';
+  } catch {
+    return 'pdf';
+  }
+};
+
+// Create and download ZIP file with documents
+export const createAndDownloadZip = async (
+  files: { url: string; studentName: string; rollNo: string; documentType?: string }[],
+  zipFileName: string
+): Promise<boolean> => {
+  try {
+    if (files.length === 0) {
+      return false;
+    }
+
+    const zip = new JSZip();
+    let successCount = 0;
+    let failCount = 0;
+
+    // Download all files and add to ZIP
+    for (const file of files) {
+      try {
+        const blob = await downloadFileAsBlob(file.url);
+        if (blob) {
+          const extension = getFileExtensionFromUrl(file.url);
+          const sanitizedName = file.studentName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
+          const sanitizedRoll = file.rollNo.replace(/[^a-zA-Z0-9]/g, '');
+          const docType = file.documentType ? `_${file.documentType}` : '';
+          const fileName = `${sanitizedRoll}_${sanitizedName}${docType}.${extension}`;
+          
+          zip.file(fileName, blob);
+          successCount++;
+        } else {
+          failCount++;
+        }
+      } catch (error) {
+        console.warn(`Failed to process file for ${file.studentName}:`, error);
+        failCount++;
+      }
+    }
+
+    if (successCount === 0) {
+      console.error('No files could be downloaded for ZIP creation');
+      return false;
+    }
+
+    // Generate ZIP file
+    const zipBlob = await zip.generateAsync({ type: 'blob' });
+    
+    if (Platform.OS === 'web') {
+      // Web implementation
+      const url = URL.createObjectURL(zipBlob);
+      const link = document.createElement('a');
+      link.href = url;
+      link.download = zipFileName;
+      document.body.appendChild(link);
+      link.click();
+      document.body.removeChild(link);
+      URL.revokeObjectURL(url);
+      return true;
+    } else {
+      // Mobile implementation
+      try {
+        const zipArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
+        const zipBase64 = btoa(String.fromCharCode(...new Uint8Array(zipArrayBuffer)));
+        
+        // Try cache directory first, then documents directory
+        const directories = [FileSystem.cacheDirectory, FileSystem.documentDirectory];
+        
+        for (const directory of directories) {
+          try {
+            const uri = directory + zipFileName;
+            
+            await FileSystem.writeAsStringAsync(uri, zipBase64, {
+              encoding: FileSystem.EncodingType.Base64,
+            });
+            
+            if (await Sharing.isAvailableAsync()) {
+              await Sharing.shareAsync(uri, {
+                mimeType: 'application/zip',
+                dialogTitle: `Save ${zipFileName}`,
+              });
+              return true;
+            }
+          } catch (error) {
+            console.log(`Failed to write to ${directory}, trying next...`);
+            continue;
+          }
+        }
+        
+        console.error('All mobile file write attempts failed');
+        return false;
+      } catch (error) {
+        console.error('Mobile ZIP creation error:', error);
+        return false;
+      }
+    }
+  } catch (error) {
+    console.error('ZIP creation error:', error);
+    return false;
+  }
+};