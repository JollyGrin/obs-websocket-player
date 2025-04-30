import { useEffect } from 'react';

interface ObsProps {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  streamActive: boolean;
  sources: any[];
  selectedSource: string;
  setSelectedSource: (v: string) => void;
  checkConnection: () => Promise<void>;
  toggleStream: () => Promise<void>;
}

export function ObsControls({
  isConnected,
  isLoading,
  error,
  streamActive,
  sources,
  selectedSource,
  setSelectedSource,
  checkConnection,
  toggleStream
}: ObsProps) {
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">OBS Connection</h2>
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected to OBS' : 'Disconnected'}</span>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Check Connection'}
        </button>
      </div>
      {isConnected && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full border rounded p-2"
              disabled={sources.length === 0}
            >
              {sources.length === 0 ? (
                <option value="">No media sources available</option>
              ) : (
                sources.map((source: any) => (
                  <option key={source.inputName} value={source.inputName}>
                    {source.inputName}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex justify-between">
            <button
              onClick={toggleStream}
              disabled={isLoading}
              className={`px-4 py-2 ${
                streamActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white rounded disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : streamActive ? 'Stop Stream' : 'Start Stream'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
