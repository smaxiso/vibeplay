import { Song, RepeatMode } from '../types'
import { formatTime } from '../utils/format'
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, ShuffleIcon, RepeatIcon, RepeatOneIcon, PlaylistIcon } from './Icons'
import Marquee from './Marquee'

interface PlayerBarProps {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  shuffle: boolean
  repeat: RepeatMode
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (seconds: number) => void
  onShuffleToggle: () => void
  onRepeatToggle: () => void
  onPlaylistToggle: () => void
  isLoading?: boolean
}

export default function PlayerBar({
  currentSong, isPlaying, currentTime, duration,
  shuffle, repeat,
  onPlay, onPause, onNext, onPrev, onSeek,
  onShuffleToggle, onRepeatToggle, onPlaylistToggle, isLoading
}: PlayerBarProps) {
  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  // YouTube thumbnail — only show if we have a valid ID
  const thumbUrl = currentSong.youtubeId
    ? `https://img.youtube.com/vi/${currentSong.youtubeId}/0.jpg`
    : ''

  const isActuallyLoading = isLoading || !currentSong.youtubeId || currentSong.title === 'Loading...'

  return (
    <div className={`player-bar-container ${isPlaying ? 'is-playing' : ''}`}>
      <div className="player-bar__neon-flow" />
      <div className="player-bar">
      {/* Row 1: Thumbnail + Song info + Main controls */}
      <div className="player-bar__row">
        <div className="player-bar__thumb-wrap">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={currentSong.title}
              className="player-bar__thumb"
              width={48}
              height={48}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : null}
          <div className="player-bar__thumb-fallback">
            {isActuallyLoading ? '...' : currentSong.title.charAt(0)}
          </div>
        </div>
        <div className="player-bar__info">
          {isActuallyLoading ? (
            <div className="player-bar__skeleton">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-artist"></div>
            </div>
          ) : (
            <>
              <Marquee text={currentSong.title} className="player-bar__title" />
              <span className="player-bar__artist">{currentSong.artist}</span>
            </>
          )}
        </div>
        <div className="player-bar__top-actions" style={{ marginLeft: 'auto' }}>
          <button onClick={onPlaylistToggle} className="player-bar__btn-sm" aria-label="Toggle playlist">
            <PlaylistIcon />
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

      {/* Row 3: Main controls */}
      <div className="player-bar__secondary">
        <button onClick={onShuffleToggle} className={`player-bar__btn-sm ${shuffle ? 'active' : ''}`} aria-label="Shuffle">
          <ShuffleIcon />
        </button>
        <button onClick={onPrev} className="player-bar__btn" aria-label="Previous track">
          <PrevIcon />
        </button>
        <button onClick={isPlaying ? onPause : onPlay} className="player-bar__btn player-bar__btn--play" aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
        </button>
        <button onClick={onNext} className="player-bar__btn" aria-label="Next track">
          <NextIcon />
        </button>
        <button onClick={onRepeatToggle} className={`player-bar__btn-sm ${repeat !== 'off' ? 'active' : ''}`} aria-label={`Repeat: ${repeat}`}>
          {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
        </button>
      </div>
      </div>
    </div>
  )
}
