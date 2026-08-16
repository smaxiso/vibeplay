const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  console.log("Videos length:", playlist.videos?.length);
  if (playlist.videos?.length > 0) {
     console.log("Video title:", playlist.videos[0].title?.text);
  } else if (playlist.items?.length > 0) {
     // try to dump the first item in a way we can parse
     const item = playlist.items[0];
     // the title might be nested inside title.text or title.runs[0].text
     console.log("Item keys:", Object.keys(item));
  }
}
main()
