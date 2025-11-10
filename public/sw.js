/**
 * Service Worker for OPT Plus Digital System
 * Provides offline support and background sync capabilities
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `opt-plus-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',      // Check cache first, fallback to network
  NETWORK_FIRST: 'network-first',  // Try network first, fallback to cache
  CACHE_ONLY: 'cache-only',        // Only serve from cache
  NETWORK_ONLY: 'network-only',    // Only fetch from network
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate', // Serve cache, update in background
};

/**
 * Install event - precache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching precache assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine caching strategy based on URL
  const strategy = getCacheStrategy(url);

  event.respondWith(
    handleFetch(request, strategy)
  );
});

/**
 * Determine caching strategy based on URL pattern
 */
function getCacheStrategy(url) {
  // API calls - Network first (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Static assets (JS, CSS, images) - Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // Dashboard and pages - Network first
  if (url.pathname.startsWith('/dashboard') || 
      url.pathname.startsWith('/children') ||
      url.pathname.startsWith('/reports')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Default - Network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Handle fetch request with specified strategy
 */
async function handleFetch(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return networkOnly(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    default:
      return networkFirst(request);
  }
}

/**
 * Cache First strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match(OFFLINE_URL);
      if (offlinePage) {
        return offlinePage;
      }
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Cache Only strategy
 */
async function cacheOnly(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  return new Response('Not in cache', { status: 404 });
}

/**
 * Network Only strategy
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached version immediately, or wait for network
  return cached || fetchPromise;
}

/**
 * Background Sync - for offline measurement submission
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);

  if (event.tag === 'sync-measurements') {
    event.waitUntil(syncMeasurements());
  }
});

/**
 * Sync pending measurements when back online
 */
async function syncMeasurements() {
  console.log('[ServiceWorker] Syncing measurements...');
  
  try {
    // Get pending measurements from IndexedDB
    const db = await openDatabase();
    const measurements = await getPendingMeasurements(db);

    if (measurements.length === 0) {
      console.log('[ServiceWorker] No pending measurements to sync');
      return;
    }

    console.log(`[ServiceWorker] Found ${measurements.length} pending measurements`);

    // Send each measurement to server
    for (const measurement of measurements) {
      try {
        const response = await fetch('/api/measurements/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(measurement),
        });

        if (response.ok) {
          // Remove from IndexedDB after successful sync
          await removeMeasurement(db, measurement.localId);
          console.log('[ServiceWorker] Synced measurement:', measurement.localId);
        } else {
          console.error('[ServiceWorker] Failed to sync measurement:', response.status);
        }
      } catch (error) {
        console.error('[ServiceWorker] Sync error:', error);
      }
    }

    // Notify the client that sync is complete
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          count: measurements.length,
        });
      });
    });

  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
    throw error; // Retry sync
  }
}

/**
 * Open IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('opt-plus-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('measurements')) {
        const store = db.createObjectStore('measurements', { keyPath: 'localId' });
        store.createIndex('childId', 'childId', { unique: false });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
      }
    };
  });
}

/**
 * Get pending measurements from IndexedDB
 */
function getPendingMeasurements(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['measurements'], 'readonly');
    const store = transaction.objectStore('measurements');
    const index = store.index('syncStatus');
    const request = index.getAll('pending');
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove measurement from IndexedDB
 */
function removeMeasurement(db, localId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['measurements'], 'readwrite');
    const store = transaction.objectStore('measurements');
    const request = store.delete(localId);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_NOW') {
    self.registration.sync.register('sync-measurements');
  }
});

console.log('[ServiceWorker] Service Worker loaded');
