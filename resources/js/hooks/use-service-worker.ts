/**
 * useServiceWorker Hook
 * Manages service worker registration and updates
 */

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) {
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Service Worker registered:', registration.scope);

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available
                setState((prev) => ({
                  ...prev,
                  isUpdateAvailable: true,
                }));
              }
            });
          }
        });

        // Check for updates periodically
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        ); // Every hour
      } catch (error) {
        console.error('[SW] Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [state.isSupported]);

  // Update service worker
  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // Trigger sync manually
  const triggerSync = async () => {
    if (state.registration && 'sync' in state.registration) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (state.registration as any).sync.register('sync-measurements');
        console.log('[SW] Background sync registered');
      } catch (error) {
        console.error('[SW] Background sync failed:', error);
      }
    }
  };

  return {
    ...state,
    updateServiceWorker,
    triggerSync,
  };
}
