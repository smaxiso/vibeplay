
import vibes from '../data/vibes.json'
import VibeCard from '../components/VibeCard'
import { Vibe } from '../types'

export default function IndexPage() {
  return (
    <div className="index-page">
      <picture className="index-page__bg">
        <source media="(max-width: 768px)" srcSet="/images/index-bg-mobile.jpg" />
        <img src="/images/index-bg-desktop.jpg" alt="" />
      </picture>
      
      <div className="app-container">
        <header className="index-header">
          <div className="index-header__top">
            <div className="index-header__brand">
              <span className="index-header__logo">🎵 VibePlay</span>
            </div>
            <button className="index-header__action" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          <div className="index-header__greeting">
            <h1 className="index-header__title">Good evening 👋</h1>
            <p className="index-header__subtitle">What's your vibe today?</p>
          </div>
        </header>

        <div className="vibe-grid">
        {(vibes as Vibe[]).map((vibe, i) => (
          <VibeCard
            key={vibe.slug}
            slug={vibe.slug}
            name={vibe.name}
            nameHindi={vibe.nameHindi}
            bgImage={vibe.bgImage}
            color={vibe.color}
            songCount={vibe.songs.length}
            index={i}
          />
        ))}
        {/* Coming soon card */}
        <div className="vibe-card coming-soon-card" style={{ animationDelay: `${vibes.length * 0.1}s` }}>
          <div className="coming-soon-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <p>More Vibes<br/>Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
