const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  const items = playlist.items.map(item => {
    return {
      title: item.metadata?.title?.text || 'Unknown Title',
      artist: item.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text || 'Unknown Artist',
      youtubeId: item.content_id,
      thumbnail: item.content_image?.image?.[0]?.url || '',
    }
  });
  console.log(items.slice(0, 3));
}
main()
