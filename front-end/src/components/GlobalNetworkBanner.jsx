import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw, X } from 'lucide-react'

export default function GlobalNetworkBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [dismissed, setDismissed] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setDismissed(false)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOffline(false)
        window.location.reload()
      } else {
        setRetrying(false)
      }
    }, 700)
  }

  if (!isOffline || dismissed) return null

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[9999] bg-[#1F1713] text-white border-b-2 border-amber-500 shadow-2xl transition-all duration-300 animate-slide-down"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="p-1.5 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
            <WifiOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </span>
          <div className="min-w-0">
            <span className="font-bold text-amber-400 tracking-wide block sm:inline mr-2">
              You are offline!
            </span>
            <span className="text-stone-300 hidden xs:inline">
              Please check your internet connection. Some features may not work.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded text-[11px] sm:text-xs transition-colors cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Connecting...' : 'Retry'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss offline banner"
            className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

