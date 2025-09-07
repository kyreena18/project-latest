import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getRequirementLabel = (type: string) => {
  const labels: Record<string, string> = {
    video_introduction: 'Video Introduction',
    portfolio: 'Portfolio',
    cover_letter: 'Cover Letter',
    certificates: 'Certificates',
    project_demo: 'Project Demo',
    coding_sample: 'Coding Sample',
  };
  return labels[type] || type.replace('_', ' ').toUpperCase();
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return '#34C759';
    case 'rejected': return '#FF3B30';
    case 'applied': return '#007AFF';
    case 'approved': return '#34C759';
    default: return '#FF9500';
  }
};

// Helper function for cross-platform file downloads
export const downloadFile = async (content: string, filename: string, mimeType: string = 'text/plain') => {
  if (Platform.OS === 'web') {
    // Web implementation using Blob and URL.createObjectURL
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } else {
    // Mobile implementation using expo-file-system and expo-sharing
    try {
      const uri = FileSystem.documentDirectory + filename;
      
      if (mimeType.includes('xlsx')) {
        await FileSystem.writeAsStringAsync(uri, content, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        await FileSystem.writeAsStringAsync(uri, content);
      }
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType,
          dialogTitle: `Save ${filename}`,
          UTI: mimeType.includes('xlsx') ? 'com.microsoft.excel.xlsx' : undefined
        });
        return true;
      } else {
        console.log(`File saved to: ${uri}`);
        return false;
      }
    } catch (error) {
      console.error('Mobile file operation error:', error);
      // Fallback to sharing the content as text
      if (await Sharing.isAvailableAsync()) {
        const tempUri = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(tempUri, content);
        await Sharing.shareAsync(tempUri);
        return true;
      }
      return false;
    }
  }
};

// Enhanced download function with better error handling
export const downloadFileWithFallback = async (content: string, filename: string, mimeType: string = 'text/plain') => {
  if (Platform.OS === 'web') {
    return downloadFile(content, filename, mimeType);
  } else {
    // Try cache directory first, then documents directory
    const directories = [FileSystem.cacheDirectory, FileSystem.documentDirectory];
    
    for (const directory of directories) {
      try {
        const uri = directory + filename;
        
        if (mimeType.includes('xlsx')) {
          await FileSystem.writeAsStringAsync(uri, content, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          await FileSystem.writeAsStringAsync(uri, content);
        }
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType,
            dialogTitle: `Save ${filename}`,
            UTI: mimeType.includes('xlsx') ? 'com.microsoft.excel.xlsx' : undefined
          });
          return true;
        }
      } catch (error) {
        console.log(`Failed to write to ${directory}, trying next...`);
        continue;
      }
    }
    
    console.error('All file write attempts failed');
    return false;
  }
};

// Helper function to convert string to array buffer for web Excel generation
export const s2ab = (s: string) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
};