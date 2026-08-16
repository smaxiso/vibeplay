const { Innertube, UniversalCache } = require('youtubei.js')
async function main() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) })
  const playlist = await yt.getPlaylist('PLeyhzp0L1Aw0')
  const items = playlist.items.map(item => ({
    title: item.title?.toString() || 'Unknown Title',
    artist: item.short_byline_text?.toString() || item.author?.name || 'Unknown Artist',
    youtubeId: item.id || item.video_id || item.content_id || '',
    duration: item.duration?.text || '',
    thumbnail: item.thumbnails?.[0]?.url || '',
  }))
  console.log(items.slice(0, 3))
}
main()
