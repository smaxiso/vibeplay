import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import IndexPage from './pages/IndexPage'

const PlayerPage = lazy(() => import('./pages/PlayerPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/vibe/:slug" element={<PlayerPage />} />
          <Route path="*" element={<IndexPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
