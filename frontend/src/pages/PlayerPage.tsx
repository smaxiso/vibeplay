import { useParams, Navigate, Link } from 'react-router-dom'
import vibes from '../data/vibes.json'
import { Vibe } from '../types'
import { useVibePlayer } from '../hooks/useVibePlayer'
import PlayerBar from '../components/PlayerBar'
import PlaylistDrawer from '../components/PlaylistDrawer'

export default function PlayerPage() {
  const { slug } = useParams<{ slug: string }>()
  const vibe = (vibes as Vibe[]).find(v => v.slug === slug)

  if (!vibe) return <Navigate to="/" replace />
  if (!vibe.playlistId && vibe.songs.length === 0) {
    return (
      <div className="player-page player-page--empty">
        <p>No songs in this vibe</p>
        <Link to="/">← Back to vibes</Link>
      </div>
    )
  }

  return <PlayerPageInner vibe={vibe} />
}

function PlayerPageInner({ vibe }: { vibe: Vibe }) {
  const { state, dispatch, seekTo, next, prev, shuffle, playerRef, apiError, isLoading, getCurrentSong, songs } = useVibePlayer(vibe)
  const currentSong = getCurrentSong()
  const youtubeUrl = currentSong?.youtubeId ? `https://www.youtube.com/watch?v=${currentSong.youtubeId}` : '#'


  return (
    <div className="player-page" style={{ '--accent': vibe.color } as React.CSSProperties}>
      {/* Full bleed background — responsive */}
      <picture>
        {vibe.bgImageMobile && (
          <source media="(max-width: 768px)" srcSet={vibe.bgImageMobile} />
        )}
        <img
          src={vibe.bgImage}
          alt=""
          className="player-page__bg"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
        />
      </picture>
      
      {/* Ambient Glow & Vignette */}
      <div className={`ambient-glow ${state.isPlaying ? 'is-playing' : ''}`} />
      <div className="vignette-overlay" />

      {/* Top bar */}
      <div className="player-page__topbar">
        <Link to="/" className="player-page__back" aria-label="Back to vibes">← Vibes</Link>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="player-page__source-link"
          aria-label="Open on YouTube"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
          </svg>
        </a>
      </div>

      {/* Vibe title */}
      <div className="player-page__title-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'nowrap', justifyContent: 'center' }}>
          <h1 className="player-page__vibe-title">{vibe.name}</h1>
          {currentSong?.youtubeId && (
            <div className={`spinning-disc ${state.isPlaying ? 'is-playing' : ''}`}>
              <img 
                src={currentSong.thumbnail || `https://img.youtube.com/vi/${currentSong.youtubeId}/0.jpg`} 
                alt="Album Art" 
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </div>
      </div>



      {/* YouTube hidden player (must be in viewport for iOS background playing) */}
      <div id="yt-player" style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', zIndex: -1 }} />

      {/* API error state */}
      {apiError && (
        <div className="player-page__error-screen">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="error-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h2>Connection Lost</h2>
          <p>We couldn't connect to the music servers. They might be sleeping or blocked by your network.</p>
          <button onClick={() => window.location.reload()} className="player-page__retry-btn">
            Retry Connection
          </button>
        </div>
      )}

      {/* Player bar */}
      {!apiError && (
        <PlayerBar
          currentSong={currentSong}
          isLoading={isLoading}
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          shuffle={state.shuffle}
          repeat={state.repeat}
          volume={state.volume}
          onPlay={() => dispatch({ type: 'PLAY' })}
          onPause={() => dispatch({ type: 'PAUSE' })}
          onNext={next}
          onPrev={prev}
          onSeek={seekTo}
          onVolumeChange={(v) => dispatch({ type: 'SET_VOLUME', payload: v })}
          onShuffleToggle={shuffle}
          onRepeatToggle={() => dispatch({ type: 'TOGGLE_REPEAT' })}
          onPlaylistToggle={() => dispatch({ type: 'TOGGLE_DRAWER' })}
        />
      )}

      {/* Playlist drawer */}
      <PlaylistDrawer
        songs={songs}
        currentIndex={state.trackIndex}
        isOpen={state.isDrawerOpen}
        onSelect={(i) => {
          if (vibe.playlistId) {
            const p = playerRef.current as any
            p?.playVideoAt?.(i)
            setTimeout(() => {
              const data = p?.getVideoData?.()
              if (data) dispatch({ type: 'SELECT_TRACK', payload: i })
            }, 500)
          } else {
            dispatch({ type: 'SELECT_TRACK', payload: i })
          }
        }}
        onClose={() => dispatch({ type: 'TOGGLE_DRAWER' })}
      />
    </div>
  )
}
