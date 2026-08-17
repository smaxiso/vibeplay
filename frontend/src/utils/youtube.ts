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


