import { useState, useEffect } from 'react';
import { useVideoFiles, VideoFile } from '../hooks/useVideoFiles';
import { useObs } from '../hooks/useObs';

export function VideoPlaylist() {
  const {
    directory,
    files,
    isLoading: filesLoading,
    error: filesError,
    loadFiles,
    formatFileSize,
    setDirectory
  } = useVideoFiles();
  
  const {
    isConnected,
    selectedSource,
    isLoading: obsLoading,
    error: obsError,
    playVideo,
    stopVideo
  } = useObs();
  
  const [directoryInput, setDirectoryInput] = useState('');
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (directoryInput && !directory) {
      setDirectoryInput(directory);
    }
  }, [directory]);

  const handleLoadDirectory = () => {
    if (directoryInput) {
      loadFiles(directoryInput);
    }
  };

  const handlePlay = (file: VideoFile) => {
    if (!isConnected || !selectedSource) return;
    
    playVideo(file.path);
    setCurrentVideo(file);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (!isConnected || !selectedSource) return;
    
    stopVideo();
    setIsPlaying(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Video Playlist</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Videos Directory
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={directoryInput}
            onChange={(e) => setDirectoryInput(e.target.value)}
            placeholder="/path/to/videos"
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={handleLoadDirectory}
            disabled={filesLoading || !directoryInput}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {filesLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
        {filesError && <p className="text-red-500 text-sm mt-1">{filesError}</p>}
      </div>
      
      {obsError && <p className="text-red-500 text-sm mb-4">{obsError}</p>}
      
      {currentVideo && (
        <div className="mb-6 p-3 bg-gray-100 rounded">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Now {isPlaying ? 'Playing' : 'Stopped'}</h3>
              <p className="text-sm text-gray-600 truncate">{currentVideo.name}</p>
            </div>
            {isPlaying ? (
              <button
                onClick={handleStop}
                disabled={obsLoading || !isConnected}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => handlePlay(currentVideo)}
                disabled={obsLoading || !isConnected}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Play
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-hidden">
        <h3 className="font-medium mb-2">Available Videos</h3>
        
        {files.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {directory ? 'No video files found in directory' : 'Please select a directory to load videos'}
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr 
                    key={file.path}
                    className={currentVideo?.path === file.path ? 'bg-blue-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {file.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handlePlay(file)}
                        disabled={obsLoading || !isConnected}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Play
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
