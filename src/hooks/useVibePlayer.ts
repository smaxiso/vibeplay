import { useReducer, useRef, useEffect, useCallback, useState } from 'react'
import { Vibe } from '../types'
import { createPlayerReducer, initialPlayerState } from './playerReducer'
import { loadYouTubeAPI } from '../utils/youtube'

export function useVibePlayer(vibe: Vibe) {
  const totalTracks = vibe.songs.length
  const reducer = useCallback(createPlayerReducer(totalTracks), [totalTracks])
  const [state, dispatch] = useReducer(reducer, initialPlayerState)
  const playerRef = useRef<YT.Player | null>(null)
  const intervalRef = useRef<number | null>(null)
  const apiLoadedRef = useRef(false)
  const [apiError, setApiError] = useState(false)

  // Load YouTube API and create player
  useEffect(() => {
    let destroyed = false

    loadYouTubeAPI()
      .then(() => {
        if (destroyed) return
        apiLoadedRef.current = true

        const player = new YT.Player('yt-player', {
          height: '0',
          width: '0',
          videoId: vibe.songs[0].youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              playerRef.current = player
              player.setVolume(initialPlayerState.volume)
              dispatch({ type: 'PLAY' })
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                dispatch({ type: 'TRACK_ENDED' })
              } else if (event.data === YT.PlayerState.PLAYING) {
                dispatch({ type: 'PLAY' })
              } else if (event.data === YT.PlayerState.PAUSED) {
                dispatch({ type: 'PAUSE' })
              }
            },
            onError: () => {
              dispatch({ type: 'NEXT' })
            },
          },
        })
      })
      .catch(() => {
        setApiError(true)
      })

    return () => {
      destroyed = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync player with state changes
  useEffect(() => {
    const p = playerRef.current
    if (!p) return

    if (state.isPlaying) {
      p.playVideo()
    } else {
      p.pauseVideo()
    }
  }, [state.isPlaying])

  // Load new track when trackIndex changes
  useEffect(() => {
    const p = playerRef.current
    if (!p) return
    const song = vibe.songs[state.trackIndex]
    if (song) {
      p.loadVideoById(song.youtubeId)
    }
  }, [state.trackIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Seek
  useEffect(() => {
    const p = playerRef.current
    if (!p) return
    p.seekTo(state.currentTime, true)
  }, [state.currentTime]) // ponytail: intentional — only seek on user action, not on polling

  // Volume
  useEffect(() => {
    playerRef.current?.setVolume(state.volume)
  }, [state.volume])

  // 1Hz polling for time update
  useEffect(() => {
    if (state.isPlaying) {
      intervalRef.current = window.setInterval(() => {
        const p = playerRef.current
        if (p && p.getCurrentTime) {
          dispatch({
            type: 'TIME_UPDATE',
            payload: {
              current: p.getCurrentTime(),
              duration: p.getDuration() || 0,
            },
          })
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isPlaying])

  return { state, dispatch, playerRef, apiError }
}
