const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  const item = playlist.items[0];
  console.log("Metadata:", JSON.stringify(item.metadata, null, 2));
  console.log("Image:", JSON.stringify(item.content_image, null, 2));
}
main()
