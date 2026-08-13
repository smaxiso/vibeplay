import { Song, RepeatMode } from '../types'
import { formatTime } from '../utils/format'

interface PlayerBarProps {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  shuffle: boolean
  repeat: RepeatMode
  volume: number
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (seconds: number) => void
  onVolumeChange: (vol: number) => void
  onShuffleToggle: () => void
  onRepeatToggle: () => void
  onPlaylistToggle: () => void
}

export default function PlayerBar({
  currentSong, isPlaying, currentTime, duration,
  shuffle, repeat, volume,
  onPlay, onPause, onNext, onPrev, onSeek,
  onVolumeChange, onShuffleToggle, onRepeatToggle, onPlaylistToggle,
}: PlayerBarProps) {
  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="player-bar">
      {/* Now playing info */}
      <div className="player-bar__info">
        <div className="player-bar__song">
          <span className="player-bar__title">{currentSong.title}</span>
          <span className="player-bar__artist">{currentSong.artist}</span>
        </div>
      </div>

      {/* Seek bar */}
      <div className="player-bar__seek">
        <span className="player-bar__time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="player-bar__slider"
          aria-label="Seek"
          style={{ '--progress': `${progress}%` } as React.CSSProperties}
        />
        <span className="player-bar__time">{formatTime(duration)}</span>
      </div>

      {/* Main controls */}
      <div className="player-bar__controls">
        <button onClick={onPrev} className="player-bar__btn" aria-label="Previous track">⏮</button>
        <button onClick={isPlaying ? onPause : onPlay} className="player-bar__btn player-bar__btn--play" aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={onNext} className="player-bar__btn" aria-label="Next track">⏭</button>
      </div>

      {/* Secondary controls */}
      <div className="player-bar__secondary">
        <button onClick={onShuffleToggle} className={`player-bar__btn-sm ${shuffle ? 'active' : ''}`} aria-label="Shuffle">🔀</button>
        <button onClick={onRepeatToggle} className={`player-bar__btn-sm ${repeat !== 'off' ? 'active' : ''}`} aria-label={`Repeat: ${repeat}`}>
          {repeat === 'one' ? '🔂' : '🔁'}
        </button>
        <button onClick={onPlaylistToggle} className="player-bar__btn-sm" aria-label="Toggle playlist">📋</button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="player-bar__volume"
          aria-label="Volume"
        />
      </div>
    </div>
  )
}
