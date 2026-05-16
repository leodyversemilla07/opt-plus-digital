/**
 * useAutoSync Hook
 * Automatically triggers offline measurement sync when connectivity is restored.
 * Also triggers sync on initial mount if online.
 */
import { useEffect, useRef } from 'react';
import { useOnlineStatus } from './use-online-status';

export function useAutoSync() {
    const isOnline = useOnlineStatus();
    const wasOffline = useRef(false);

    useEffect(() => {
        if (isOnline && wasOffline.current) {
            triggerSync();
        }

        wasOffline.current = !isOnline;
    }, [isOnline]);

    // Fire sync on mount if online
    useEffect(() => {
        if (isOnline) {
            triggerSync();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

function triggerSync(): void {
    try {
        if ('serviceWorker' in navigator) {
            // Notify the SW directly to sync
            navigator.serviceWorker.ready.then((registration) => {
                registration.active?.postMessage({ type: 'SYNC_NOW' });
            });
        }
    } catch (e) {
        console.warn('[AutoSync] Failed to trigger sync:', e);
    }
}
