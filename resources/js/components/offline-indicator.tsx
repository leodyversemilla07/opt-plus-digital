/**
 * Offline Status Indicator Component
 * Shows when the app is offline and displays pending sync count
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { offlineDB } from '@/lib/offline-db';
import { Cloud, RefreshCw, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const { triggerSync } = useServiceWorker();
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync handler
    const handleSync = useCallback(async () => {
        if (!isOnline) {
            return;
        }

        setIsSyncing(true);

        try {
            await triggerSync();
            // Sync status will update via message listener
        } catch (error) {
            console.error('Sync failed:', error);
            setIsSyncing(false);
        }
    }, [isOnline, triggerSync]);

    // Update pending count
    useEffect(() => {
        const updatePendingCount = async () => {
            try {
                const stats = await offlineDB.getStorageStats();
                setPendingCount(stats.pendingSync);
            } catch (error) {
                console.error('Failed to get pending count:', error);
            }
        };

        updatePendingCount();

        // Update every 10 seconds
        const interval = setInterval(updatePendingCount, 10000);

        // Listen for sync complete messages
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SYNC_COMPLETE') {
                updatePendingCount();
                setIsSyncing(false);
            }
        };

        navigator.serviceWorker?.addEventListener('message', handleMessage);

        return () => {
            clearInterval(interval);
            navigator.serviceWorker?.removeEventListener(
                'message',
                handleMessage,
            );
        };
    }, []);

    // Auto-sync when coming back online
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isOnline && pendingCount > 0) {
            // Delay sync slightly to avoid cascading renders
            timeoutId = setTimeout(() => {
                handleSync();
            }, 100);
        }

        return () => clearTimeout(timeoutId);
    }, [isOnline, pendingCount, handleSync]);

    // Don't show anything if online and no pending data
    if (isOnline && pendingCount === 0) {
        return null;
    }

    return (
        <div className="fixed right-4 bottom-4 z-50 max-w-md">
            {!isOnline ? (
                <Alert className="border-orange-200 bg-orange-50">
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-orange-900">
                                You're Offline
                            </p>
                            <p className="text-sm text-orange-700">
                                Data will sync when connection is restored
                                {pendingCount > 0 &&
                                    ` (${pendingCount} pending)`}
                            </p>
                        </div>
                    </AlertDescription>
                </Alert>
            ) : pendingCount > 0 ? (
                <Alert className="border-blue-200 bg-blue-50">
                    {isSyncing ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                        <Cloud className="h-4 w-4 text-blue-600" />
                    )}
                    <AlertDescription className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-blue-900">
                                {isSyncing ? 'Syncing...' : 'Sync Pending'}
                            </p>
                            <p className="text-sm text-blue-700">
                                {pendingCount}{' '}
                                {pendingCount === 1
                                    ? 'measurement'
                                    : 'measurements'}{' '}
                                waiting
                            </p>
                        </div>
                        {!isSyncing && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSync}
                                className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                                <RefreshCw className="mr-2 h-3 w-3" />
                                Sync Now
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            ) : null}
        </div>
    );
}
