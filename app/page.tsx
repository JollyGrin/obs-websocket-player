"use client";

import { useObs } from './hooks/useObs';
import { ObsControls } from './components/ObsControls';
import { VideoPlaylist } from './components/VideoPlaylist';

export default function Home() {
  const obs = useObs();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">OBS Video Playlist Manager</h1>
        <ObsControls {...obs} />
        <VideoPlaylist {...obs} />
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Connect to OBS via WebSocket to manage your video playlist</p>
        </div>
      </main>
    </div>
  );
}
