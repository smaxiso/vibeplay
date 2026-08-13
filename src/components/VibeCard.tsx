import { Link } from 'react-router-dom'

interface VibeCardProps {
  slug: string
  name: string
  nameHindi: string
  bgImage: string
  color: string
  songCount: number
}

export default function VibeCard({ slug, nameHindi, bgImage, color, songCount }: VibeCardProps) {
  return (
    <Link to={`/vibe/${slug}`} className="vibe-card" style={{ '--accent': color } as React.CSSProperties}>
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
        <h2 className="vibe-card__title">{nameHindi}</h2>
        <span className="vibe-card__count">{songCount} songs</span>
      </div>
    </Link>
  )
}
