import vibes from '../data/vibes.json'
import VibeCard from '../components/VibeCard'
import { Vibe } from '../types'

export default function IndexPage() {
  return (
    <div className="index-page">
      <picture className="index-page__bg">
        <source media="(max-width: 768px)" srcSet="/images/index-bg-mobile.png" />
        <img src="/images/index-bg-desktop.png" alt="" />
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
        <p>Made with care by <a href="https://github.com/smaxiso" target="_blank" rel="noopener noreferrer">smaxiso</a></p>
      </footer>
    </div>
  )
}
