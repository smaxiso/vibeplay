const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  const item = playlist.items[0];
  console.log("ITEM KEYS", Object.keys(item));
  if (item.title) {
    console.log("TITLE", typeof item.title, Object.keys(item.title));
    console.log("TITLE toString", item.title.toString());
  } else {
    console.log("No title property!");
  }
}
main()
