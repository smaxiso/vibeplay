import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import IndexPage from './pages/IndexPage'
import InstallPrompt from './components/InstallPrompt'

const PlayerPage = lazy(() => import('./pages/PlayerPage'))

export default function App() {
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
