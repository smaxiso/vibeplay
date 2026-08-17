import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Innertube, UniversalCache } from 'youtubei.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBES_PATH = path.join(__dirname, '../src/data/vibes.json');

async function main() {
  console.log('Initializing YouTube API...');
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  
  console.log('Reading vibes config...');
  const data = await fs.readFile(VIBES_PATH, 'utf-8');
  const vibes = JSON.parse(data);
  
  for (const vibe of vibes) {
    if (!vibe.playlistId) continue;
    
    console.log(`Fetching playlist ${vibe.playlistId} for vibe "${vibe.name}"...`);
    try {
      const playlist = await yt.getPlaylist(vibe.playlistId);
      
      const items = playlist.items.map(item => {
        return {
          title: item.metadata?.title?.text || 'Unknown Title',
          artist: item.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text || 'Unknown Artist',
          youtubeId: item.content_id,
          duration: '',
          thumbnail: item.content_image?.image?.[0]?.url || '',
        }
      });
      
      vibe.songs = items;
      console.log(`Successfully fetched ${items.length} songs for "${vibe.name}"`);
    } catch (err) {
      console.error(`Failed to fetch playlist ${vibe.playlistId}:`, err.message);
    }
  }
  
  console.log('Writing updated vibes.json...');
  await fs.writeFile(VIBES_PATH, JSON.stringify(vibes, null, 2));
  console.log('Done! Playlist data embedded.');
}

main().catch(console.error);
