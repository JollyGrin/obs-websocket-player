# OBS Video Playlist Manager

A web application that connects to OBS Studio via WebSocket to manage and stream a playlist of video files.


https://github.com/user-attachments/assets/f1d11bbd-2a8a-45c9-bb6d-4b7a68563fac


## Features

- Connect to OBS Studio via WebSocket protocol
- Scan and display video files from a local directory
- Play and stop videos directly in OBS
- Toggle streaming on/off
- Select between multiple media sources in OBS

## Requirements

- OBS Studio with WebSocket Server enabled (v28 or higher)
- Bun (or Node.js) installed on your system

## Setup

### 1. Configure OBS WebSocket

1. Open OBS Studio
2. Go to `Tools` > `WebSocket Server Settings`
3. Check `Enable WebSocket Server`
4. Default port is `4455` (change in app/config.ts if needed)
5. Set a password if needed (update in app/config.ts)

### 2. Install Dependencies

```bash
# Navigate to the project directory
cd obs-playlist-manager

# Install dependencies
bun install
```

### 3. Start the Development Server

```bash
bun run dev
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect to OBS by clicking the "Check Connection" button
2. Select the media source in OBS from the dropdown
3. Enter the directory path containing your video files and click "Load"
4. Click on a video in the list to play it
5. Use the "Start Stream" / "Stop Stream" button to control streaming

## Technical Details

- Built with Next.js and TypeScript
- Uses obs-websocket-js for OBS communication
- Tailwind CSS for styling
- API Routes for handling OBS WebSocket and file system operations

## Project Structure

- `app/api/obs/route.ts` - API routes for OBS WebSocket interactions
- `app/api/files/route.ts` - API routes for scanning video files
- `app/components/` - React components
- `app/hooks/` - Custom React hooks for OBS and file management
- `app/config.ts` - OBS WebSocket configuration

## License

MIT
