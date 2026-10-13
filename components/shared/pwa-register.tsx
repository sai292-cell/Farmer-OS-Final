'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('FarmerOS service worker registration failed', error)
      })
    }
  }, [])
  return null
}
