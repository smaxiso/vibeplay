import { useReducer, useRef, useEffect, useCallback, useState } from 'react'
import { Vibe, Song } from '../types'
import { createPlayerReducer, initialPlayerState } from './playerReducer'
import { loadYouTubeAPI } from '../utils/youtube'

interface VideoData {
  title: string
  author: string
  video_id: string
}

export function useVibePlayer(vibe: Vibe) {
  const isPlaylistMode = !!vibe.playlistId
  const reducer = useCallback(createPlayerReducer(isPlaylistMode ? 999 : vibe.songs.length), [vibe.songs.length, isPlaylistMode])
  const [state, dispatch] = useReducer(reducer, initialPlayerState)
  const playerRef = useRef<YT.Player | null>(null)
  const intervalRef = useRef<number | null>(null)
  const [apiError, setApiError] = useState(false)
  const [currentVideoData, setCurrentVideoData] = useState<VideoData | null>(null)
  const [playlistTracks] = useState<Song[]>([])
  const isFirstLoad = useRef(true)

  // Get effective songs list (from JSON or from playlist)
  const songs = isPlaylistMode ? playlistTracks : vibe.songs

  // Load YouTube API and create player
  useEffect(() => {
    let destroyed = false

    loadYouTubeAPI()
      .then(() => {
        if (destroyed) return

        const playerOptions: YT.PlayerOptions = {
          height: '0',
          width: '0',
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
              isFirstLoad.current = false

              // If playlist mode, load the playlist
              if (isPlaylistMode && vibe.playlistId) {
                (p as any).loadPlaylist({
                  list: vibe.playlistId,
                  listType: 'playlist',
                  index: 0,
                })
                // Pause immediately — we don't want autoplay
                setTimeout(() => p.pauseVideo(), 500)
              }

              updateVideoData()
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                if (isPlaylistMode) {
                  // In playlist mode, YT handles advancement — we just track it
                  setTimeout(updateVideoData, 500)
                } else {
                  dispatch({ type: 'TRACK_ENDED' })
                }
              }
              if (event.data === YT.PlayerState.PLAYING) {
                dispatch({ type: 'PLAY' })
                updateVideoData()
              }
              if (event.data === YT.PlayerState.PAUSED) {
                // Only sync pause if user triggered it (not during load)
                if (!isFirstLoad.current) {
                  dispatch({ type: 'PAUSE' })
                }
              }
            },
            onError: () => {
              if (isPlaylistMode) {
                (playerRef.current as any)?.nextVideo?.()
              } else {
                dispatch({ type: 'NEXT' })
              }
            },
          },
        }

        // For non-playlist mode, set initial videoId
        if (!isPlaylistMode) {
          playerOptions.videoId = vibe.songs[0].youtubeId
        }

        new YT.Player('yt-player', playerOptions)
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

  // Update video data from YouTube player
  const updateVideoData = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    try {
      const data = (p as any).getVideoData?.()
      if (data && data.video_id) {
        setCurrentVideoData(data)

        // In playlist mode, build track info from YouTube data
        if (isPlaylistMode) {
          const playlistIndex = (p as any).getPlaylistIndex?.() ?? 0
          dispatch({ type: 'SELECT_TRACK', payload: playlistIndex })
        }
      }
    } catch (_) { /* not available yet */ }
  }, [isPlaylistMode])

  // Sync play/pause to player (non-playlist mode)
  useEffect(() => {
    const p = playerRef.current
    if (!p || isFirstLoad.current) return
    if (state.isPlaying) {
      p.playVideo()
    } else {
      p.pauseVideo()
    }
  }, [state.isPlaying])

  // Load new track when trackIndex changes (non-playlist mode only)
  useEffect(() => {
    if (isPlaylistMode) return
    const p = playerRef.current
    if (!p || isFirstLoad.current) return
    const song = vibe.songs[state.trackIndex]
    if (song) {
      p.loadVideoById(song.youtubeId)
    }
  }, [state.trackIndex, isPlaylistMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Volume sync
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

  // Seek handler
  const seekTo = useCallback((seconds: number) => {
    const p = playerRef.current
    if (p) p.seekTo(seconds, true)
    dispatch({ type: 'SEEK', payload: seconds })
  }, [])

  // Next/Prev for playlist mode
  const next = useCallback(() => {
    if (isPlaylistMode) {
      (playerRef.current as any)?.nextVideo?.()
      setTimeout(updateVideoData, 800)
    } else {
      dispatch({ type: 'NEXT' })
    }
  }, [isPlaylistMode, updateVideoData])

  const prev = useCallback(() => {
    if (isPlaylistMode) {
      (playerRef.current as any)?.previousVideo?.()
      setTimeout(updateVideoData, 800)
    } else {
      dispatch({ type: 'PREV' })
    }
  }, [isPlaylistMode, updateVideoData])

  const shuffle = useCallback(() => {
    if (isPlaylistMode) {
      const p = playerRef.current as any
      if (state.shuffle) {
        p?.setShuffle?.(false)
      } else {
        p?.setShuffle?.(true)
      }
    }
    dispatch({ type: 'TOGGLE_SHUFFLE' })
  }, [isPlaylistMode, state.shuffle])

  // Get current song info — from YouTube data or JSON
  const getCurrentSong = useCallback((): Song => {
    if (isPlaylistMode && currentVideoData) {
      return {
        title: currentVideoData.title || 'Loading...',
        artist: currentVideoData.author || '',
        youtubeId: currentVideoData.video_id || '',
        duration: '',
      }
    }
    const jsonSong = vibe.songs[state.trackIndex]
    if (!jsonSong) return { title: 'Loading...', artist: '', youtubeId: '', duration: '' }
    if (currentVideoData && currentVideoData.video_id === jsonSong.youtubeId) {
      return {
        ...jsonSong,
        title: jsonSong.title || currentVideoData.title,
        artist: jsonSong.artist || currentVideoData.author,
      }
    }
    return jsonSong
  }, [state.trackIndex, currentVideoData, vibe.songs, isPlaylistMode])

  return { state, dispatch, seekTo, next, prev, shuffle, playerRef, apiError, getCurrentSong, songs, isPlaylistMode }
}
