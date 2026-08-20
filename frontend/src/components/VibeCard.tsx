import { Link } from 'react-router-dom'

interface VibeCardProps {
  slug: string
  name: string
  nameHindi: string
  bgImage: string
  color: string
  songCount: number
  index: number
}

export default function VibeCard({ slug, name, nameHindi, bgImage, color, songCount, index }: VibeCardProps) {
  return (
    <Link 
      to={`/vibe/${slug}`} 
      className="vibe-card" 
      style={{ 
        '--accent': color,
        'animationDelay': `${index * 0.1}s` 
      } as React.CSSProperties}
    >
      <img
        src={bgImage}
        alt={nameHindi}
        loading="lazy"
        width={400}
        height={240}
        className="vibe-card__bg"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <div className="vibe-card__overlay">
        <div className="vibe-card__play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h2 className={`vibe-card__title ${name === 'Yo Yo' ? 'holographic-text' : ''}`}>{name}</h2>
        {songCount > 0 && (
          <span className="vibe-card__count">
            {songCount} songs
          </span>
        )}
      </div>
    </Link>
  )
}
