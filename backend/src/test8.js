const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  const item = playlist.items[0];
  console.log("Title obj:", JSON.stringify(item.title, null, 2));
  console.log("Author obj:", JSON.stringify(item.author, null, 2));
}
main()
