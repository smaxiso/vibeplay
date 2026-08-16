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
// (Replaced by Piped API InnerTube Proxy)

interface PlaylistItem {
  title: string
  artist: string
  youtubeId: string
  duration: string
  thumbnail: string
}

export async function fetchPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  // Try multiple backends in order: Vercel (fastest), Render (fallback), Localhost (dev)
  const API_URLS = [
    'https://vibeplay-api.vercel.app/api/playlist',
    'https://vibeplay-api.onrender.com/api/playlist',
    'http://localhost:3001/api/playlist'
  ]

  for (const url of API_URLS) {
    try {
      const res = await fetch(`${url}/${playlistId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.items) return data.items
      }
    } catch (err) {
      console.warn(`Failed to fetch from ${url}, trying next fallback...`)
    }
  }

  console.error('All backend API fallbacks failed.')
  return []
}
