const yts = require("yt-search");
async function main() {
  const list = await yts({ listId: 'PLeyhzp0L1Aw0' });
  const items = list.videos.map(v => ({
    title: v.title,
    artist: v.author.name,
    youtubeId: v.videoId,
    duration: v.duration?.timestamp || '',
    thumbnail: v.thumbnail || ''
  }));
  console.log(items.slice(0, 3));
}
main();
