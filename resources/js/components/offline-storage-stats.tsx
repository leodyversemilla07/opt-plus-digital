import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { offlineDB } from '@/lib/offline-db';
import { Database, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StorageStats {
    totalChildren: number;
    pendingMeasurements: number;
    queuedSyncs: number;
}

export function OfflineStorageStats() {
    const [stats, setStats] = useState<StorageStats>({
        totalChildren: 0,
        pendingMeasurements: 0,
        queuedSyncs: 0,
    });
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [children, measurements] = await Promise.all([
                offlineDB.getAllCachedChildren(),
                offlineDB.getPendingMeasurements(),
            ]);

            setStats({
                totalChildren: children.length,
                pendingMeasurements: measurements.length,
                queuedSyncs: measurements.length, // For now, same as pending measurements
            });
        } catch (error) {
            console.error('Failed to load storage stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearCache = async () => {
        if (
            !confirm(
                'Are you sure you want to clear all offline data? Pending measurements will be lost.',
            )
        ) {
            return;
        }

        setClearing(true);
        try {
            await offlineDB.clearAll();
            await loadStats();
            alert('Offline data cleared successfully');
        } catch (error) {
            console.error('Failed to clear cache:', error);
            alert('Failed to clear offline data. Please try again.');
        } finally {
            setClearing(false);
        }
    };

    const getTotalItems = () => {
        return (
            stats.totalChildren + stats.pendingMeasurements + stats.queuedSyncs
        );
    };

    const getStoragePercentage = () => {
        // Estimate: Assume 50MB total storage, 1KB per item average
        const estimatedUsedKB = getTotalItems() * 1;
        const totalKB = 50 * 1024; // 50MB
        return Math.min((estimatedUsedKB / totalKB) * 100, 100);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Loading Stats...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Offline Storage
                        </CardTitle>
                        <CardDescription>
                            Local data cached for offline access
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={loadStats}
                            disabled={loading}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleClearCache}
                            disabled={clearing || getTotalItems() === 0}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border p-4">
                        <p className="text-sm font-medium text-muted-foreground">
                            Cached Children
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                            {stats.totalChildren}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                            Available Offline
                        </Badge>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                        <p className="text-sm font-medium text-muted-foreground">
                            Pending Measurements
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                            {stats.pendingMeasurements}
                        </p>
                        <Badge
                            variant={
                                stats.pendingMeasurements > 0
                                    ? 'default'
                                    : 'secondary'
                            }
                            className="mt-2"
                        >
                            {stats.pendingMeasurements > 0
                                ? 'Needs Sync'
                                : 'All Synced'}
                        </Badge>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                        <p className="text-sm font-medium text-muted-foreground">
                            Total Items
                        </p>
                        <p className="mt-2 text-2xl font-bold">
                            {getTotalItems()}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                            In Storage
                        </Badge>
                    </div>
                </div>

                {/* Storage Usage */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Estimated Storage Usage
                        </span>
                        <span className="font-medium">
                            {getStoragePercentage().toFixed(1)}%
                        </span>
                    </div>
                    <Progress value={getStoragePercentage()} />
                    <p className="text-xs text-muted-foreground">
                        ~{(getTotalItems() * 1).toFixed(0)} KB used of ~50 MB
                        available
                    </p>
                </div>

                {/* Warning if near limit */}
                {getStoragePercentage() > 80 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Storage usage is high. Consider clearing old cached
                        data.
                    </div>
                )}

                {/* Info */}
                {getTotalItems() === 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                        No offline data cached. Visit pages while online to
                        cache data for offline access.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
