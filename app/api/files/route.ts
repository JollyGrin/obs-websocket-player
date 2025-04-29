import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Supported video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];

// Scan directory for video files
async function scanDirectory(directoryPath: string) {
  try {
    const files = await fs.promises.readdir(directoryPath);
    const videoFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return VIDEO_EXTENSIONS.includes(ext);
      })
      .map(file => ({
        name: file,
        path: path.join(directoryPath, file),
        ext: path.extname(file).toLowerCase(),
        size: fs.statSync(path.join(directoryPath, file)).size,
      }));
    
    return videoFiles;
  } catch (error) {
    console.error('Error scanning directory:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const directory = searchParams.get('directory');
  
  if (!directory) {
    return NextResponse.json({ error: 'Directory path is required' }, { status: 400 });
  }
  
  try {
    const videoFiles = await scanDirectory(directory);
    return NextResponse.json({ files: videoFiles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
