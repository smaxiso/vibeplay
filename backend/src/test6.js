const YouTube = require("youtube-sr").default;
async function main() {
  const playlist = await YouTube.getPlaylist('https://www.youtube.com/playlist?list=PLeyhzp0L1Aw0', { fetchAll: true });
  if (!playlist) return console.error("Playlist not found");
  const items = playlist.videos.map(v => ({
    title: v.title,
    artist: v.channel?.name || '',
    youtubeId: v.id,
    duration: v.durationFormatted || '',
    thumbnail: v.thumbnail?.url || ''
  }));
  console.log(items.slice(0, 3));
}
main();
