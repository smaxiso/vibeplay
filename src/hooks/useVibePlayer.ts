import { useReducer, useRef, useEffect, useCallback, useState } from 'react'
import { Vibe, Song } from '../types'
import { createPlayerReducer, initialPlayerState } from './playerReducer'
import { loadYouTubeAPI, fetchPlaylistItems } from '../utils/youtube'

export function useVibePlayer(vibe: Vibe) {
  const [songs, setSongs] = useState<Song[]>(vibe.songs)
  const [isLoading, setIsLoading] = useState(!!vibe.playlistId)
  const [apiError, setApiError] = useState(false)

  const totalTracks = songs.length || 1
  const reducer = useCallback(createPlayerReducer(totalTracks), [totalTracks])
  const [state, dispatch] = useReducer(reducer, initialPlayerState)
  const playerRef = useRef<YT.Player | null>(null)
  const intervalRef = useRef<number | null>(null)
  const playerReady = useRef(false)

  // Fetch playlist tracks from YouTube Data API (if playlistId)
  useEffect(() => {
    if (!vibe.playlistId) return

    fetchPlaylistItems(vibe.playlistId)
      .then(items => {
        if (items.length > 0) {
          setSongs(items)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [vibe.playlistId])

  // Load YouTube IFrame API and create player
  useEffect(() => {
    if (songs.length === 0) return

    let destroyed = false

    loadYouTubeAPI()
      .then(() => {
        if (destroyed) return

        const player = new YT.Player('yt-player', {
          height: '0',
          width: '0',
          videoId: songs[0].youtubeId,
          playerVars: {
            autoplay: 0,
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
              playerReady.current = true
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                dispatch({ type: 'TRACK_ENDED' })
              }
            },
            onError: () => {
              // Skip to next on error (video unavailable/region blocked)
              dispatch({ type: 'NEXT' })
            },
          },
        })
      })
      .catch(() => setApiError(true))

    return () => {
      destroyed = true
      playerRef.current?.destroy()
      playerRef.current = null
      playerReady.current = false
    }
  }, [songs.length > 0 ? songs[0].youtubeId : '']) // eslint-disable-line react-hooks/exhaustive-deps

  // Play / Pause sync
  useEffect(() => {
    if (!playerReady.current) return
    const p = playerRef.current
    if (!p) return
    if (state.isPlaying) {
      p.playVideo()
    } else {
      p.pauseVideo()
    }
  }, [state.isPlaying])

  // Track change — load new video
  useEffect(() => {
    if (!playerReady.current) return
    const p = playerRef.current
    if (!p) return
    const song = songs[state.trackIndex]
    if (song) {
      p.loadVideoById(song.youtubeId)
      // loadVideoById auto-plays, so ensure state reflects that
      if (!state.isPlaying) {
        dispatch({ type: 'PLAY' })
      }
    }
  }, [state.trackIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Volume sync
  useEffect(() => {
    playerRef.current?.setVolume(state.volume)
  }, [state.volume])

  // 1Hz time polling
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
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isPlaying])

  // Seek — direct call
  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
    dispatch({ type: 'SEEK', payload: seconds })
  }, [])

  // Next / Prev / Shuffle — simple dispatches (no playlist API needed)
  const next = useCallback(() => dispatch({ type: 'NEXT' }), [])
  const prev = useCallback(() => dispatch({ type: 'PREV' }), [])
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), [])

  // Current song
  const getCurrentSong = useCallback((): Song => {
    return songs[state.trackIndex] || { title: 'Loading...', artist: '', youtubeId: '', duration: '' }
  }, [state.trackIndex, songs])

  return { state, dispatch, seekTo, next, prev, shuffle: toggleShuffle, playerRef, apiError, isLoading, getCurrentSong, songs }
}
