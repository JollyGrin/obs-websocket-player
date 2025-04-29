import { useState, useCallback } from 'react';

export function useObs() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');

  // Check OBS connection status
  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/obs?action=status');
      const data = await response.json();
      setIsConnected(data.connected);
      if (data.connected) {
        // If connected, also get sources
        await getSources();
      }
    } catch (err) {
      setError('Failed to check OBS connection');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get available sources from OBS
  const getSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/obs?action=sources');
      const data = await response.json();
      
      // Filter to only include media sources
      const mediaSources = data.sources.filter((source: any) => 
        source.inputKind === 'ffmpeg_source' || 
        source.inputKind === 'vlc_source' ||
        source.inputKind.includes('media')
      );
      
      setSources(mediaSources);
      
      if (mediaSources.length > 0 && !selectedSource) {
        setSelectedSource(mediaSources[0].inputName);
      }
    } catch (err) {
      setError('Failed to get OBS sources');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSource]);

  // Play a video file
  const playVideo = useCallback(async (filePath: string) => {
    if (!selectedSource) {
      setError('No media source selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/obs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'playMedia',
          params: {
            sourceName: selectedSource,
            filePath
          }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to play video');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to play video');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSource]);

  // Stop the current video
  const stopVideo = useCallback(async () => {
    if (!selectedSource) {
      setError('No media source selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await fetch('/api/obs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stopMedia',
          params: {
            sourceName: selectedSource
          }
        })
      });
    } catch (err) {
      setError('Failed to stop video');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSource]);

  // Toggle streaming on/off
  const toggleStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/obs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleStream'
        })
      });
      
      const data = await response.json();
      setStreamActive(data.status === 'started');
    } catch (err) {
      setError('Failed to toggle stream');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    streamActive,
    sources,
    selectedSource,
    setSelectedSource,
    checkConnection,
    getSources,
    playVideo,
    stopVideo,
    toggleStream
  };
}
