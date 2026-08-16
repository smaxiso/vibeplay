import { Song } from '../types'

interface PlaylistDrawerProps {
  songs: Song[]
  currentIndex: number
  isOpen: boolean
  onSelect: (index: number) => void
  onClose: () => void
}

export default function PlaylistDrawer({ songs, currentIndex, isOpen, onSelect, onClose }: PlaylistDrawerProps) {
  return (
    <div className={`playlist-drawer ${isOpen ? 'open' : ''}`}>
      <div className="playlist-drawer__header">
        <h3>Playlist</h3>
        <button onClick={onClose} className="playlist-drawer__close" aria-label="Close playlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      {songs.length === 0 ? (
        <div className="playlist-drawer__empty">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="playlist-drawer__item" style={{ pointerEvents: 'none' }}>
              <div className="skeleton-thumb" style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton-line skeleton-title" style={{ width: '80%' }}></div>
                <div className="skeleton-line skeleton-artist" style={{ width: '50%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="playlist-drawer__list">
          {songs.map((song, index) => (
            <li
              key={`${song.youtubeId}-${index}`}
              className={`playlist-drawer__item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onSelect(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(index)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Play ${song.title || `Track ${index + 1}`}`}
            >
              <span className="playlist-drawer__num">{index === currentIndex ? '\u25B6' : index + 1}</span>
              {song.youtubeId && (
                <img
                  src={`https://img.youtube.com/vi/${song.youtubeId}/default.jpg`}
                  alt=""
                  className="playlist-drawer__thumb"
                  width={40}
                  height={30}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div className="playlist-drawer__meta">
                <span className="playlist-drawer__song-title">{song.title || `Track ${index + 1}`}</span>
                <span className="playlist-drawer__artist">{song.artist}</span>
              </div>
              {song.duration && (
                <span className="playlist-drawer__duration">{song.duration}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
