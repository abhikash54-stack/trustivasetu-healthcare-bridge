'use client'

import { useEffect, useState } from 'react'

const CONSENT_KEY = 'trustiva-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (!stored) setVisible(true)
    } catch {
      // localStorage unavailable (private mode etc.) — hide banner
    }
  }, [])

  function accept() {
    try { localStorage.setItem(CONSENT_KEY, 'accepted') } catch {}
    setVisible(false)
  }

  function decline() {
    try { localStorage.setItem(CONSENT_KEY, 'declined') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 shadow-2xl border-t border-white/10"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm flex-1 text-gray-300 leading-relaxed">
          We use cookies to maintain secure sessions and improve your experience. Essential authentication
          cookies cannot be disabled. For details, see our{' '}
          <a href="/privacy-policy" className="underline text-white hover:text-gray-300">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={decline}
            className="px-4 py-2 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition text-gray-300"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="px-4 py-2 text-sm bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
