import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import IndexPage from './pages/IndexPage'
import InstallPrompt from './components/InstallPrompt'
import { loadYouTubeAPI } from './utils/youtube'
import { PlayerProvider } from './contexts/PlayerContext'
import MiniPlayer from './components/MiniPlayer'

const PlayerPage = lazy(() => import('./pages/PlayerPage'))

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])
  // Option 1 Implementation: Mobile Playback Delay Fix
  useEffect(() => {
    // 1. Eagerly preload the YouTube IFrame API on app load so it's instantly ready
    loadYouTubeAPI().catch(() => {})

    // 2. The "Silent Audio Unlock" hack
    // iOS and Android require a direct user interaction to allow media playback.
    // By playing a silent audio file on the very first tap anywhere in the app, 
    // we permanently "unlock" the Web Audio / Media API for this session.
    // When the YouTube IFrame loads seconds later, it won't be blocked!
    const unlockAudio = () => {
      // 1-frame silent WAV base64
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA')
      audio.loop = true // Loop continuously to prevent the OS from suspending the background tab
      
      // Store it globally so it doesn't get garbage collected
      ;(window as any)._silentAudio = audio
      
      audio.play().catch(() => {})
      
      // We only need to start the loop once per session
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('click', unlockAudio)
    }

    document.addEventListener('touchstart', unlockAudio, { once: true })
    document.addEventListener('click', unlockAudio, { once: true })

    return () => {
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('click', unlockAudio)
    }
  }, [])

  return (
    <PlayerProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="app-loader"><div className="spinner"></div></div>}>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/vibe/:slug" element={<PlayerPage />} />
            <Route path="*" element={<IndexPage />} />
          </Routes>
        </Suspense>
        <MiniPlayer />
        <InstallPrompt />
        <div className={`offline-toast ${isOffline ? 'visible' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l22 22"></path>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          You're offline. Music playback paused.
        </div>
      </BrowserRouter>
    </PlayerProvider>
  )
}
