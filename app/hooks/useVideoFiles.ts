import { useState, useCallback } from 'react';

export interface VideoFile {
  name: string;
  path: string;
  ext: string;
  size: number;
}

export function useVideoFiles() {
  const [directory, setDirectory] = useState<string>('');
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load video files from a directory
  const loadFiles = useCallback(async (directoryPath: string) => {
    if (!directoryPath) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/files?directory=${encodeURIComponent(directoryPath)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
      setDirectory(directoryPath);
    } catch (err: any) {
      setError(err.message || 'Failed to load video files');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    directory,
    files,
    isLoading,
    error,
    loadFiles,
    formatFileSize,
    setDirectory
  };
}
