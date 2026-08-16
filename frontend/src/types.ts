export interface Song {
  title: string
  artist: string
  youtubeId: string
  duration: string
  thumbnail?: string
}

export interface Vibe {
  slug: string
  name: string
  nameHindi: string
  bgImage: string
  bgImageMobile?: string
  color: string
  songs: Song[]
  playlistId?: string   // YouTube playlist ID (e.g., PLxxxxxxx) — future: auto-fetch songs from this
  playlistUrl?: string  // Full YouTube playlist URL for "open source" link
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerState {
  trackIndex: number
  isPlaying: boolean
  shuffle: boolean
  repeat: RepeatMode
  volume: number
  currentTime: number
  duration: number
  isDrawerOpen: boolean
  shuffleOrder: number[]
}

export type PlayerAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SELECT_TRACK'; payload: number }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TIME_UPDATE'; payload: { current: number; duration: number } }
  | { type: 'TRACK_ENDED' }
  | { type: 'TOGGLE_DRAWER' }
