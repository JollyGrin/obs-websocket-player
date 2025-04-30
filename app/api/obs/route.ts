import { NextResponse } from 'next/server';
import OBSWebSocket from 'obs-websocket-js';
import { OBS_CONFIG } from '@/app/config';

// Initialize OBS WebSocket connection
const obs = new OBSWebSocket();
let isConnected = false;

// Helper function to ensure OBS is connected
async function ensureConnected() {
  if (!isConnected) {
    try {
      await obs.connect(OBS_CONFIG.address, OBS_CONFIG.password);
      isConnected = true;
      console.log('Connected to OBS WebSocket server');
    } catch (err) {
      console.error('Failed to connect to OBS WebSocket server:', err);
      throw new Error('Failed to connect to OBS WebSocket');
    }
  }
  return obs;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const obs = await ensureConnected();
    
    switch(action) {
      case 'status':
        return NextResponse.json({ connected: isConnected });
      
      case 'sources':
        // Use GetInputList for OBS WebSocket v5+
        const { inputs } = await obs.call('GetInputList');
        // Filter for Media Source (ffmpeg_source) inputs
        const sources = inputs.filter((input: any) => input.inputKind === 'ffmpeg_source');
        return NextResponse.json({ sources });
      
      case 'scenes':
        const { scenes } = await obs.call('GetSceneList');
        return NextResponse.json({ scenes });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    isConnected = false;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const obs = await ensureConnected();
    const body = await request.json();
    const { action, params } = body;

    switch(action) {
      case 'playMedia':
        if (!params.sourceName || !params.filePath) {
          return NextResponse.json({ error: 'Missing source name or file path' }, { status: 400 });
        }
        console.log(`[OBS] Setting input '${params.sourceName}' to file '${params.filePath}'`);
        // Set media source file
        await obs.call('SetInputSettings', {
          inputName: params.sourceName,
          inputSettings: {
            local_file: params.filePath
          }
        });
        console.log(`[OBS] Triggering playback on input '${params.sourceName}'`);
        // Play the media (v5+ method)
        await obs.call('TriggerMediaInputAction', {
          inputName: params.sourceName,
          mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY'
        });
        return NextResponse.json({ success: true });
      
      case 'stopMedia':
        if (!params.sourceName) {
          return NextResponse.json({ error: 'Missing source name' }, { status: 400 });
        }
        console.log(`[OBS] Stopping playback on input '${params.sourceName}'`);
        await obs.call('TriggerMediaInputAction', {
          inputName: params.sourceName,
          mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP'
        });
        return NextResponse.json({ success: true });
      
      case 'toggleStream':
        const streamStatus = await obs.call('GetStreamStatus');
        if (streamStatus.outputActive) {
          await obs.call('StopStream');
          return NextResponse.json({ status: 'stopped' });
        } else {
          await obs.call('StartStream');
          return NextResponse.json({ status: 'started' });
        }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    isConnected = false;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
