const yt = require("youtube-ext");
async function main() {
  const playlist = await yt.playlistInfo('PLeyhzp0L1Aw0');
  const items = playlist.videos.map(v => ({
    title: v.title,
    artist: v.channel?.name || '',
    youtubeId: v.id,
    duration: '',
    thumbnail: v.thumbnails?.[0]?.url || ''
  }));
  console.log(items.slice(0, 3));
}
main();
