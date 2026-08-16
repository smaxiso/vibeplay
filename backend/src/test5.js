const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  console.log("Keys:", Object.keys(playlist.items[0]))
  console.log("Type:", playlist.items[0].type)
  console.log("Title property:", playlist.items[0].title)
  console.log("Entire object:", JSON.stringify(playlist.items[0], null, 2))
}
main()
