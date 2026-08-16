import { useEffect } from 'react'

interface KeyboardShortcutHandlers {
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
  onMuteToggle: () => void
}

export function useKeyboardShortcuts({
  onPlayPause,
  onNext,
  onPrev,
  onMuteToggle
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case ' ': // Spacebar
          e.preventDefault()
          onPlayPause()
          break
        case 'ArrowRight':
          e.preventDefault()
          onNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onPrev()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          onMuteToggle()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPlayPause, onNext, onPrev, onMuteToggle])
}
