// YouTube IFrame API singleton loader
let apiLoadPromise: Promise<void> | null = null

export function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise
  if (window.YT && window.YT.Player) return Promise.resolve()

  apiLoadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () => reject(new Error('Failed to load YouTube API'))
    document.head.appendChild(script)
    ;(window as unknown as Record<string, unknown>).onYouTubeIframeAPIReady = () => resolve()
  })
  return apiLoadPromise
}

// YouTube Data API v3 — fetch playlist items (free, 10k units/day)
const YT_API_KEY = 'AIzaSyB82yqH92PdzboIRxHRW-ApXuvOvQyDiQs' // Same Firebase key works for YT Data API

interface PlaylistItem {
  title: string
  artist: string
  youtubeId: string
  duration: string
  thumbnail: string
}

export async function fetchPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = []
  let nextPageToken = ''

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YT_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
    
    const res = await fetch(url)
    if (!res.ok) {
      console.error('YouTube Data API error:', res.status)
      break
    }
    
    const data = await res.json()
    
    for (const item of data.items || []) {
      const snippet = item.snippet
      if (!snippet || snippet.title === 'Private video' || snippet.title === 'Deleted video') continue
      
      items.push({
        title: snippet.title || '',
        artist: snippet.videoOwnerChannelTitle?.replace(' - Topic', '') || '',
        youtubeId: snippet.resourceId?.videoId || '',
        duration: '',
        thumbnail: snippet.thumbnails?.default?.url || '',
      })
    }
    
    nextPageToken = data.nextPageToken || ''
  } while (nextPageToken)

  return items
}
