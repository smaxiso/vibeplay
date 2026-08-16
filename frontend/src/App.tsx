import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import IndexPage from './pages/IndexPage'
import InstallPrompt from './components/InstallPrompt'
import { loadYouTubeAPI } from './utils/youtube'

const PlayerPage = lazy(() => import('./pages/PlayerPage'))

export default function App() {
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
      audio.play().catch(() => {})
      
      // We only need to do this once per session
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
    <BrowserRouter>
      <Suspense fallback={<div className="app-loader"><div className="spinner"></div></div>}>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/vibe/:slug" element={<PlayerPage />} />
          <Route path="*" element={<IndexPage />} />
        </Routes>
      </Suspense>
      <InstallPrompt />
    </BrowserRouter>
  )
}
