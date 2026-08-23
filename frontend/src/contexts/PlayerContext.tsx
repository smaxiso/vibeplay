import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Vibe } from '../types'
import { useVibePlayer as useVibePlayerHook } from '../hooks/useVibePlayer'

interface PlayerContextType {
  vibe: Vibe | null
  loadVibe: (newVibe: Vibe) => void
  playerHook: ReturnType<typeof useVibePlayerHook> | null
  isPlayerActive: boolean
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [activeVibe, setActiveVibe] = useState<Vibe | null>(null)
  
  // We need a dummy vibe to pass to the hook when nothing is loaded, 
  // but it's better to only mount the hook logic when we have a vibe, or pass a default.
  // Since hooks can't be called conditionally, we'll pass a dummy vibe and ignore it until activeVibe is set.
  const dummyVibe: Vibe = { slug: '', name: '', nameHindi: '', bgImage: '', color: '', playlistId: '', songs: [] }
  
  const playerHook = useVibePlayerHook(activeVibe || dummyVibe)
  const [isPlayerActive, setIsPlayerActive] = useState(false)

  // Force sync tracks and update OS status bar theme color
  useEffect(() => {
    if (activeVibe) {
      setIsPlayerActive(true)
      
      // Update the notch/status bar color to match the vibe
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", activeVibe.color || "#1a1a2e")
      }
    } else {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#1a1a2e")
      }
    }
    
    // Cleanup when component unmounts
    return () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#1a1a2e")
      }
    }
  }, [activeVibe])

  const loadVibe = (newVibe: Vibe) => {
    // If it's the same vibe, just do nothing
    if (activeVibe?.slug === newVibe.slug) return
    setActiveVibe(newVibe)
  }

  return (
    <PlayerContext.Provider value={{ vibe: activeVibe, loadVibe, playerHook, isPlayerActive }}>
      {children}
      {/* YouTube hidden player (must be in viewport for iOS background playing) */}
      <div id="yt-player" style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', zIndex: -1 }} />
    </PlayerContext.Provider>
  )
}

export function useGlobalPlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('useGlobalPlayer must be used within a PlayerProvider')
  }
  return context
}
