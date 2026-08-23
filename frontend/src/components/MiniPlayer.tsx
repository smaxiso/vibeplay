import { Link } from 'react-router-dom'
import { useGlobalPlayer } from '../contexts/PlayerContext'

export default function MiniPlayer() {
  const { vibe, playerHook, isPlayerActive } = useGlobalPlayer()
  
  if (!isPlayerActive || !vibe || !playerHook) return null

  const { state, getCurrentSong, play, pause, next } = playerHook
  const currentSong = getCurrentSong()

  // Don't show mini player if we are already on the player page for this vibe
  // Actually, we should probably check the route, but a simple check is if we're on the vibe's page.
  if (window.location.pathname === `/vibe/${vibe.slug}`) return null

  return (
    <div className="mini-player">
      <Link to={`/vibe/${vibe.slug}`} viewTransition className="mini-player__info">
        <div className="mini-player__art-wrapper">
          <img 
            src={vibe.bgImage} 
            alt="" 
            className="mini-player__art" 
            style={{ viewTransitionName: `vibe-cover-${vibe.slug}` } as React.CSSProperties}
          />
        </div>
        <div className="mini-player__meta">
          <span className="mini-player__title">{currentSong?.title || 'Loading...'}</span>
          <span className="mini-player__artist">{currentSong?.artist || vibe.name}</span>
        </div>
      </Link>
      
      <div className="mini-player__controls">
        <button className="mini-player__btn" onClick={(e) => { e.preventDefault(); state.isPlaying ? pause() : play() }}>
          {state.isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button className="mini-player__btn" onClick={(e) => { e.preventDefault(); next() }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>
    </div>
  )
}
