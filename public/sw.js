const CACHE_NAME = 'farmeros-shell-v1'
const APP_SHELL = ['/en', '/manifest.webmanifest', '/icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Never cache external Esri ArcGIS services or Supabase API calls
  const isArcGis =
    url.hostname.includes('arcgis.com') ||
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('ibasemaps-api.arcgis.com')

  const isSupabase =
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/v1') ||
    url.pathname.startsWith('/auth/v1')

  if (isArcGis || isSupabase) {
    return
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match('/en'))),
  )
})
