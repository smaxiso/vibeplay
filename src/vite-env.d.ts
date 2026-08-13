/// <reference types="vite/client" />

// YouTube IFrame API types
declare namespace YT {
  class Player {
    constructor(elementId: string, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    seekTo(seconds: number, allowSeekAhead?: boolean): void
    setVolume(volume: number): void
    loadVideoById(videoId: string): void
    getCurrentTime(): number
    getDuration(): number
    destroy(): void
  }

  interface PlayerOptions {
    height?: string | number
    width?: string | number
    videoId?: string
    playerVars?: Record<string, unknown>
    events?: {
      onReady?: (event: { target: Player }) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onError?: (event: { data: number }) => void
    }
  }

  interface OnStateChangeEvent {
    data: number
    target: Player
  }

  const PlayerState: {
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: () => void
}
