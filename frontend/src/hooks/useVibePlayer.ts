import { useReducer, useRef, useEffect, useCallback, useState } from 'react'
import { Vibe, Song } from '../types'
import { createPlayerReducer, initialPlayerState } from './playerReducer'
import { loadYouTubeAPI, fetchPlaylistItems } from '../utils/youtube'

export function useVibePlayer(vibe: Vibe) {
  const [songs, setSongs] = useState<Song[]>(vibe.songs)
  const [isLoading, setIsLoading] = useState(!!vibe.playlistId)
  const [apiError, setApiError] = useState(false)
  const [usePlaylistFallback, setUsePlaylistFallback] = useState(false)

  const totalTracks = songs.length || 1
  const reducer = useCallback(createPlayerReducer(totalTracks), [totalTracks])
  const [state, dispatch] = useReducer(reducer, initialPlayerState)
  const playerRef = useRef<YT.Player | null>(null)
  const intervalRef = useRef<number | null>(null)
  const playerReady = useRef(false)
  const errorCountRef = useRef(0)
  const lastErrorTimeRef = useRef(0)
  const intendedPlayingRef = useRef(state.isPlaying)

  useEffect(() => {
    intendedPlayingRef.current = state.isPlaying
  }, [state.isPlaying])

  // Fetch playlist tracks — try Piped API first, fallback to IFrame playlist
  useEffect(() => {
    if (!vibe.playlistId) return

    fetchPlaylistItems(vibe.playlistId).then(items => {
      if (items.length > 0) {
        setSongs(items)
      } else {
        // All proxies failed (returned []) — fall back to IFrame playlist mode silently
        setUsePlaylistFallback(true)
      }
      setIsLoading(false)
    })
  }, [vibe.playlistId])

  // Load YouTube IFrame API and create player
  useEffect(() => {
    // Wait until we have songs OR we're in playlist fallback mode
    if (songs.length === 0 && !usePlaylistFallback) return

    let destroyed = false

    loadYouTubeAPI()
      .then(() => {
        if (destroyed) return

        const firstVideoId = songs.length > 0 ? songs[0].youtubeId : undefined

        const playerConfig: YT.PlayerOptions = {
          height: '100', // Non-zero dimensions prevent the browser from pausing background tabs
          width: '100',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target as unknown as YT.Player
              const p = playerRef.current
              p.setVolume(initialPlayerState.volume)
              playerReady.current = true

              if (intendedPlayingRef.current) {
                p.playVideo()
              }

              // If fallback mode, cue the playlist to get video IDs
              if (usePlaylistFallback && vibe.playlistId) {
                (p as any).cuePlaylist({
                  list: vibe.playlistId,
                  listType: 'playlist',
                  index: 0,
                })
                // After cueing, grab the playlist video IDs
                setTimeout(() => {
                  const videoIds: string[] = (p as any).getPlaylist?.() || []
                  if (videoIds.length > 0) {
                    const tracks = videoIds.map((id: string, i: number) => ({
                      title: `Track ${i + 1}`,
                      artist: '',
                      youtubeId: id,
                      duration: '',
                    }))
                    setSongs(tracks)
                    // Now cue the first video individually for clean playback
                    p.cueVideoById(videoIds[0])
                  }
                  // Get title of first track
                  setTimeout(() => {
                    const data = (p as any).getVideoData?.()
                    if (data && data.title) {
                      setSongs(prev => {
                        const updated = [...prev]
                        if (updated[0]) {
                          updated[0] = { ...updated[0], title: data.title, artist: data.author || '' }
                        }
                        return updated
                      })
                    }
                  }, 1500)
                }, 2000)
              }
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                dispatch({ type: 'TRACK_ENDED' })
              }
              // When a track starts playing, update its title from video data
              if (event.data === YT.PlayerState.PLAYING && usePlaylistFallback) {
                const data = (playerRef.current as any)?.getVideoData?.()
                if (data && data.title) {
                  const idx = state.trackIndex
                  setSongs(prev => {
                    const updated = [...prev]
                    if (updated[idx]) {
                      updated[idx] = { ...updated[idx], title: data.title, artist: data.author || '' }
                    }
                    return updated
                  })
                }
              }
            },
            onError: () => {
              const now = Date.now()
              if (now - lastErrorTimeRef.current < 2000) {
                errorCountRef.current += 1
              } else {
                errorCountRef.current = 1
              }
              lastErrorTimeRef.current = now

              if (errorCountRef.current > 3) {
                console.error("Too many consecutive playback errors. Pausing playback.")
                dispatch({ type: 'PAUSE' })
                setApiError(true)
                return
              }
              
              dispatch({ type: 'NEXT' })
            },
          },
        }

        if (firstVideoId) {
          playerConfig.videoId = firstVideoId
        }

        new YT.Player('yt-player', playerConfig)
      })
      .catch(() => setApiError(true))

    return () => {
      destroyed = true
      playerRef.current?.destroy()
      playerRef.current = null
      playerReady.current = false
    }
  }, [songs.length > 0 || usePlaylistFallback ? 'ready' : 'waiting']) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Direct play/pause for mobile Safari (must be synchronous with click)
  const play = useCallback(() => {
    playerRef.current?.playVideo()
    dispatch({ type: 'PLAY' })
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
    dispatch({ type: 'PAUSE' })
  }, [])

  // Next / Prev / Shuffle — simple dispatches
  const next = useCallback(() => dispatch({ type: 'NEXT' }), [])
  const prev = useCallback(() => dispatch({ type: 'PREV' }), [])
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), [])

  // Current song
  const getCurrentSong = useCallback((): Song => {
    return songs[state.trackIndex] || { title: 'Loading...', artist: '', youtubeId: '', duration: '' }
  }, [state.trackIndex, songs])

  // Media Session API for lock screen controls and background play
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const song = songs[state.trackIndex]
      if (song && song.title !== 'Loading...') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title,
          artist: song.artist || 'VibePlay',
          album: vibe.nameHindi,
          artwork: song.thumbnail ? [{ src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' }] : []
        })
      }
    }
  }, [state.trackIndex, songs, vibe.nameHindi])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', play)
      navigator.mediaSession.setActionHandler('pause', pause)
      navigator.mediaSession.setActionHandler('previoustrack', prev)
      navigator.mediaSession.setActionHandler('nexttrack', next)
    }
  }, [play, pause, prev, next])

  return { state, dispatch, play, pause, seekTo, next, prev, shuffle: toggleShuffle, playerRef, apiError, isLoading, getCurrentSong, songs }
}
