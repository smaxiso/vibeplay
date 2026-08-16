import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandAloneMatch = window.matchMedia('(display-mode: standalone)').matches
    // @ts-ignore
    const navStandalone = window.navigator.standalone
    if (isStandAloneMatch || navStandalone) {
      setIsStandalone(true)
      return
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // Capture install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt after 15 seconds of usage
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 15000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  if (isStandalone || !showPrompt) return null
  if (!isIOS && !deferredPrompt) return null // If not iOS and no prompt event, don't show

  return (
    <div className="install-prompt">
      <div className="install-prompt__content">
        <button className="install-prompt__close" onClick={() => setShowPrompt(false)}>×</button>
        <h3>Enjoying VibePlay?</h3>
        <p>Install the app on your home screen for the best experience!</p>
        
        {isIOS ? (
          <div className="install-prompt__ios-instructions">
            Tap the <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', margin: '0 4px'}}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> <strong>Share</strong> icon, then select <strong>Add to Home Screen</strong>.
          </div>
        ) : (
          <button className="install-prompt__btn" onClick={handleInstallClick}>
            Install App
          </button>
        )}
      </div>
    </div>
  )
}
