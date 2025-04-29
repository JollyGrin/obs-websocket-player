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
        const { sources } = await obs.call('GetSourcesList');
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
        
        // Set media source file
        await obs.call('SetInputSettings', {
          inputName: params.sourceName,
          inputSettings: {
            local_file: params.filePath
          }
        });
        
        // Play the media
        await obs.call('TriggerMediaAction', {
          sourceName: params.sourceName,
          mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY'
        });
        
        return NextResponse.json({ success: true });
      
      case 'stopMedia':
        if (!params.sourceName) {
          return NextResponse.json({ error: 'Missing source name' }, { status: 400 });
        }
        
        await obs.call('TriggerMediaAction', {
          sourceName: params.sourceName,
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
