// The Sports Room (TSR) Official PWA Service Worker
const CACHE_NAME = 'tsr-pwa-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo-preview.png',
  '/site.webmanifest',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml'
];

// External third-party ad script support (preserved from previous setup)
try {
  self.options = {
    "domain": "5gvci.com",
    "zoneId": 11507409
  };
  self.lary = "";
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');
} catch (e) {
  // Gracefully handle network restriction or ad-blocker environments
}

// 1. Install Event: Cache Core App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('TSR SW: Some static assets failed caching during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-first for dynamic data, Cache-first for images & static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin analytics/ads or API requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('unsplash.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // Navigation requests (HTML): Network first with offline fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Image & Static Assets: Stale-while-revalidate or Cache-First
  if (request.destination === 'image' || request.destination === 'font' || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background to refresh cache
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // If offline and request is logo, return cached logo
          if (request.destination === 'image') {
            return caches.match('/logo-preview.png');
          }
        });
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
