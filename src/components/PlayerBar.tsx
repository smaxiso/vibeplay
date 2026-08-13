import { Song, RepeatMode } from '../types'
import { formatTime } from '../utils/format'
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon, PlaylistIcon, VolumeIcon } from './Icons'

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
  // YouTube thumbnail with fallback to colored initial
  const thumbUrl = `https://img.youtube.com/vi/${currentSong.youtubeId}/0.jpg`

  return (
    <div className="player-bar">
      {/* Row 1: Thumbnail + Song info + Main controls */}
      <div className="player-bar__row">
        <div className="player-bar__thumb-wrap">
          <img
            src={thumbUrl}
            alt={currentSong.title}
            className="player-bar__thumb"
            width={48}
            height={48}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="player-bar__thumb-fallback">
            {currentSong.title.charAt(0)}
          </div>
        </div>
        <div className="player-bar__info">
          <span className="player-bar__title">{currentSong.title}</span>
          <span className="player-bar__artist">{currentSong.artist}</span>
        </div>
        <div className="player-bar__main-controls">
          <button onClick={onPrev} className="player-bar__btn" aria-label="Previous track">
            <PrevIcon />
          </button>
          <button onClick={isPlaying ? onPause : onPlay} className="player-bar__btn player-bar__btn--play" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
          </button>
          <button onClick={onNext} className="player-bar__btn" aria-label="Next track">
            <NextIcon />
          </button>
        </div>
      </div>

      {/* Row 2: Seek bar */}
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

      {/* Row 3: Secondary controls */}
      <div className="player-bar__secondary">
        <button onClick={onShuffleToggle} className={`player-bar__btn-sm ${shuffle ? 'active' : ''}`} aria-label="Shuffle">
          <ShuffleIcon />
        </button>
        <button onClick={onRepeatToggle} className={`player-bar__btn-sm ${repeat !== 'off' ? 'active' : ''}`} aria-label={`Repeat: ${repeat}`}>
          {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
        </button>
        <button onClick={onPlaylistToggle} className="player-bar__btn-sm" aria-label="Toggle playlist">
          <PlaylistIcon />
        </button>
        <div className="player-bar__vol-group">
          <VolumeIcon size={14} />
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
    </div>
  )
}
