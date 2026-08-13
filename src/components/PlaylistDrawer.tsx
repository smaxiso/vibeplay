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
        <h3>Playlist{songs.length > 0 ? ` (${songs.length} songs)` : ''}</h3>
        <button onClick={onClose} className="playlist-drawer__close" aria-label="Close playlist">✕</button>
      </div>
      {songs.length === 0 ? (
        <div className="playlist-drawer__empty">
          <p>Playing from YouTube playlist — tracks load automatically.</p>
        </div>
      ) : (
        <ul className="playlist-drawer__list">
          {songs.map((song, index) => (
          <li
            key={`${song.youtubeId}-${index}`}
            className={`playlist-drawer__item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => onSelect(index)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelect(index) }}
            tabIndex={0}
            role="button"
            aria-label={`Play ${song.title}`}
          >
            <span className="playlist-drawer__num">{index === currentIndex ? '▶' : index + 1}</span>
            <div className="playlist-drawer__meta">
              <span className="playlist-drawer__song-title">{song.title}</span>
              <span className="playlist-drawer__artist">{song.artist}</span>
            </div>
            <span className="playlist-drawer__duration">{song.duration}</span>
          </li>
        ))}
        </ul>
      )}
    </div>
  )
}
