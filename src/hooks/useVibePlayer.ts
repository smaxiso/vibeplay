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
  const totalTracks = vibe.songs.length
  const reducer = useCallback(createPlayerReducer(totalTracks), [totalTracks])
  const [state, dispatch] = useReducer(reducer, initialPlayerState)
  const playerRef = useRef<YT.Player | null>(null)
  const intervalRef = useRef<number | null>(null)
  const [apiError, setApiError] = useState(false)
  const [currentVideoData, setCurrentVideoData] = useState<VideoData | null>(null)
  const isFirstLoad = useRef(true)

  // Load YouTube API and create player
  useEffect(() => {
    let destroyed = false

    loadYouTubeAPI()
      .then(() => {
        if (destroyed) return

        const player = new YT.Player('yt-player', {
          height: '0',
          width: '0',
          videoId: vibe.songs[0].youtubeId,
          playerVars: {
            autoplay: 0, // Start paused — user clicks play
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
              // Don't autoplay — stay paused until user clicks
              isFirstLoad.current = false
              // Get video data from YouTube
              try {
                const data = (player as any).getVideoData?.()
                if (data) setCurrentVideoData(data)
              } catch (_) { /* not available yet */ }
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === YT.PlayerState.ENDED) {
                dispatch({ type: 'TRACK_ENDED' })
              }
              // Update video data when a new video starts
              if (event.data === YT.PlayerState.PLAYING) {
                try {
                  const data = (playerRef.current as any)?.getVideoData?.()
                  if (data) setCurrentVideoData(data)
                } catch (_) {}
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

  // Sync play/pause to player
  useEffect(() => {
    const p = playerRef.current
    if (!p || isFirstLoad.current) return
    if (state.isPlaying) {
      p.playVideo()
    } else {
      p.pauseVideo()
    }
  }, [state.isPlaying])

  // Load new track when trackIndex changes
  useEffect(() => {
    const p = playerRef.current
    if (!p || isFirstLoad.current) return
    const song = vibe.songs[state.trackIndex]
    if (song) {
      p.loadVideoById(song.youtubeId)
    }
  }, [state.trackIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Volume sync
  useEffect(() => {
    playerRef.current?.setVolume(state.volume)
  }, [state.volume])

  // 1Hz polling for time update (read-only)
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

  // Seek handler — direct call, no useEffect loop
  const seekTo = useCallback((seconds: number) => {
    const p = playerRef.current
    if (p) {
      p.seekTo(seconds, true)
    }
    dispatch({ type: 'SEEK', payload: seconds })
  }, [])

  // Get enriched song info — prefer YouTube data if available, fall back to JSON
  const getCurrentSong = useCallback((): Song => {
    const jsonSong = vibe.songs[state.trackIndex]
    if (currentVideoData && currentVideoData.video_id === jsonSong.youtubeId) {
      return {
        ...jsonSong,
        // Use YouTube title/artist if JSON has placeholder data
        title: jsonSong.title || currentVideoData.title,
        artist: jsonSong.artist || currentVideoData.author,
      }
    }
    return jsonSong
  }, [state.trackIndex, currentVideoData, vibe.songs])

  return { state, dispatch, seekTo, playerRef, apiError, getCurrentSong }
}
