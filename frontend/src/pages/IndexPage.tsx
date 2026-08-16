import { useEffect } from 'react'
import vibes from '../data/vibes.json'
import VibeCard from '../components/VibeCard'
import { Vibe } from '../types'
import { fetchPlaylistItems } from '../utils/youtube'

export default function IndexPage() {
  // Preload playlists in the background for zero-delay mobile loading
  useEffect(() => {
    ;(vibes as Vibe[]).forEach(vibe => {
      if (vibe.playlistId) {
        fetchPlaylistItems(vibe.playlistId).catch(() => {})
      }
    })
  }, [])

  return (
    <div className="index-page">
      <picture className="index-page__bg">
        <source media="(max-width: 768px)" srcSet="/images/index-bg-mobile.jpg" />
        <img src="/images/index-bg-desktop.jpg" alt="" />
      </picture>
      <header className="index-header">
        <div className="index-header__glass">
          <h1 className="index-header__title">VibePlay</h1>
          <p className="index-header__subtitle">Pick your vibe, play your music</p>
        </div>
      </header>

      <div className="vibe-grid">
        {(vibes as Vibe[]).map(vibe => (
          <VibeCard
            key={vibe.slug}
            slug={vibe.slug}
            name={vibe.name}
            nameHindi={vibe.nameHindi}
            bgImage={vibe.bgImage}
            color={vibe.color}
            songCount={vibe.songs.length}
            isPlaylist={!!vibe.playlistId}
          />
        ))}
        {/* Coming soon card */}
        <div className="vibe-card coming-soon-card">
          <div className="coming-soon-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <p>More Vibes<br/>Coming Soon</p>
          </div>
        </div>
      </div>

      <a href="https://smaxiso.web.app" target="_blank" rel="noopener noreferrer" className="artist-signature index-signature">smaxiso</a>
    </div>
  )
}
