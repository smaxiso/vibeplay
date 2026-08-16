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
      </div>

      <footer className="index-footer">
        <p>Made with ❤️ by <a href="https://smaxiso.web.app" target="_blank" rel="noopener noreferrer">smaxiso</a></p>
      </footer>
    </div>
  )
}
