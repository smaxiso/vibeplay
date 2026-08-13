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
  if (vibe.songs.length === 0) {
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
  const { state, dispatch, apiError } = useVibePlayer(vibe)
  const currentSong = vibe.songs[state.trackIndex]

  return (
    <div className="player-page" style={{ '--accent': vibe.color } as React.CSSProperties}>
      {/* Full bleed background */}
      <img
        src={vibe.bgImage}
        alt=""
        className="player-page__bg"
        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0' }}
      />

      {/* Top bar */}
      <div className="player-page__topbar">
        <Link to="/" className="player-page__back" aria-label="Back to vibes">← Vibes</Link>
      </div>

      {/* Vibe title */}
      <div className="player-page__title-area">
        <h1 className="player-page__vibe-title">{vibe.nameHindi}</h1>
      </div>

      {/* YouTube hidden player */}
      <div id="yt-player" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

      {/* API error state */}
      {apiError && (
        <div className="player-page__error">
          <p>Unable to load player. Check your connection and reload.</p>
        </div>
      )}

      {/* Player bar */}
      {!apiError && (
        <PlayerBar
          currentSong={currentSong}
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          shuffle={state.shuffle}
          repeat={state.repeat}
          volume={state.volume}
          onPlay={() => dispatch({ type: 'PLAY' })}
          onPause={() => dispatch({ type: 'PAUSE' })}
          onNext={() => dispatch({ type: 'NEXT' })}
          onPrev={() => dispatch({ type: 'PREV' })}
          onSeek={(s) => dispatch({ type: 'SEEK', payload: s })}
          onVolumeChange={(v) => dispatch({ type: 'SET_VOLUME', payload: v })}
          onShuffleToggle={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
          onRepeatToggle={() => dispatch({ type: 'TOGGLE_REPEAT' })}
          onPlaylistToggle={() => dispatch({ type: 'TOGGLE_DRAWER' })}
        />
      )}

      {/* Playlist drawer */}
      <PlaylistDrawer
        songs={vibe.songs}
        currentIndex={state.trackIndex}
        isOpen={state.isDrawerOpen}
        onSelect={(i) => dispatch({ type: 'SELECT_TRACK', payload: i })}
        onClose={() => dispatch({ type: 'TOGGLE_DRAWER' })}
      />
    </div>
  )
}
