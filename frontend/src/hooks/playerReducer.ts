import { PlayerState, PlayerAction, RepeatMode } from '../types'

export function generateShuffleOrder(currentIndex: number, totalTracks: number): number[] {
  const order = Array.from({ length: totalTracks }, (_, i) => i)
  // Fisher-Yates shuffle
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  // Move current track to front
  const currentPos = order.indexOf(currentIndex)
  if (currentPos !== 0) {
    ;[order[0], order[currentPos]] = [order[currentPos], order[0]]
  }
  return order
}

export function computeNextIndex(state: PlayerState, totalTracks: number): number {
  if (state.shuffle) {
    const currentShufflePos = state.shuffleOrder.indexOf(state.trackIndex)
    const nextShufflePos = currentShufflePos + 1
    if (nextShufflePos >= totalTracks) {
      return state.repeat === 'off' ? state.trackIndex : state.shuffleOrder[0]
    }
    return state.shuffleOrder[nextShufflePos]
  }
  const next = state.trackIndex + 1
  if (next >= totalTracks) {
    return state.repeat === 'off' ? state.trackIndex : 0
  }
  return next
}

export function computePrevIndex(state: PlayerState, totalTracks: number): number {
  if (state.shuffle) {
    const currentShufflePos = state.shuffleOrder.indexOf(state.trackIndex)
    return currentShufflePos > 0
      ? state.shuffleOrder[currentShufflePos - 1]
      : state.shuffleOrder[totalTracks - 1]
  }
  return state.trackIndex > 0 ? state.trackIndex - 1 : totalTracks - 1
}

function handleTrackEnded(state: PlayerState, totalTracks: number): PlayerState {
  switch (state.repeat) {
    case 'one':
      return { ...state, currentTime: 0, isPlaying: true }
    case 'all':
      return { ...state, trackIndex: computeNextIndex({ ...state, repeat: 'all' }, totalTracks), currentTime: 0, isPlaying: true }
    case 'off': {
      const nextIndex = computeNextIndex(state, totalTracks)
      if (nextIndex === state.trackIndex) {
        return { ...state, isPlaying: false, currentTime: 0 }
      }
      return { ...state, trackIndex: nextIndex, currentTime: 0, isPlaying: true }
    }
  }
}

export function createPlayerReducer(totalTracks: number) {
  return function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
    switch (action.type) {
      case 'PLAY':
        return { ...state, isPlaying: true }

      case 'PAUSE':
        return { ...state, isPlaying: false }

      case 'NEXT':
        return { ...state, trackIndex: computeNextIndex(state, totalTracks), isPlaying: true, currentTime: 0 }

      case 'PREV':
        if (state.currentTime > 3) {
          return { ...state, currentTime: 0 }
        }
        return { ...state, trackIndex: computePrevIndex(state, totalTracks), isPlaying: true, currentTime: 0 }

      case 'SEEK':
        return { ...state, currentTime: action.payload }

      case 'SELECT_TRACK':
        return { ...state, trackIndex: action.payload, isPlaying: true, currentTime: 0 }

      case 'TOGGLE_SHUFFLE': {
        const shuffle = !state.shuffle
        return {
          ...state,
          shuffle,
          shuffleOrder: shuffle ? generateShuffleOrder(state.trackIndex, totalTracks) : []
        }
      }

      case 'TOGGLE_REPEAT': {
        const modes: RepeatMode[] = ['off', 'all', 'one']
        const next = modes[(modes.indexOf(state.repeat) + 1) % 3]
        return { ...state, repeat: next }
      }

      case 'SET_VOLUME':
        return { ...state, volume: Math.max(0, Math.min(100, action.payload)) }

      case 'TIME_UPDATE':
        return { ...state, currentTime: action.payload.current, duration: action.payload.duration }

      case 'TRACK_ENDED':
        return handleTrackEnded(state, totalTracks)

      case 'TOGGLE_DRAWER':
        return { ...state, isDrawerOpen: !state.isDrawerOpen }

      default:
        return state
    }
  }
}

const savedState = typeof window !== 'undefined' ? localStorage.getItem('vibeplay_state') : null
const parsedState = savedState ? JSON.parse(savedState) : null

export const initialPlayerState: PlayerState = {
  trackIndex: parsedState?.trackIndex ?? 0,
  isPlaying: false,
  shuffle: parsedState?.shuffle ?? false,
  repeat: parsedState?.repeat ?? 'off',
  volume: parsedState?.volume ?? 80,
  currentTime: 0,
  duration: 0,
  isDrawerOpen: false,
  shuffleOrder: [],
}
