/**
 * IndexedDB Manager for Offline Storage
 * Provides a simple interface for storing and retrieving data offline
 */

const DB_NAME = 'opt-plus-offline';
const DB_VERSION = 1;

// Object stores
const STORES = {
    MEASUREMENTS: 'measurements',
    CHILDREN: 'children',
    SYNC_QUEUE: 'sync_queue',
};

// Type definitions
interface MeasurementData {
    localId?: string;
    child_id: string;
    measurement_date: string;
    weight_kg: number;
    height_length_cm: number;
    measurement_type?: string;
    muac_cm?: number;
    notes?: string;
    syncStatus?: string;
    createdAt?: string;
    [key: string]: unknown;
}

export interface ChildData {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
    barangay?: {
        id: string;
        name: string;
    };
    [key: string]: unknown;
}

export class OfflineDB {
    private db: IDBDatabase | null = null;

    /**
     * Open database connection
     */
    async open(): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create measurements store
                if (!db.objectStoreNames.contains(STORES.MEASUREMENTS)) {
                    const measurementStore = db.createObjectStore(
                        STORES.MEASUREMENTS,
                        {
                            keyPath: 'localId',
                            autoIncrement: false,
                        },
                    );
                    measurementStore.createIndex('childId', 'childId', {
                        unique: false,
                    });
                    measurementStore.createIndex('syncStatus', 'syncStatus', {
                        unique: false,
                    });
                    measurementStore.createIndex('createdAt', 'createdAt', {
                        unique: false,
                    });
                }

                // Create children store (for offline viewing)
                if (!db.objectStoreNames.contains(STORES.CHILDREN)) {
                    const childStore = db.createObjectStore(STORES.CHILDREN, {
                        keyPath: 'id',
                    });
                    childStore.createIndex('barangayId', 'barangay_id', {
                        unique: false,
                    });
                    childStore.createIndex('lastName', 'last_name', {
                        unique: false,
                    });
                }

                // Create sync queue store
                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    syncStore.createIndex('status', 'status', {
                        unique: false,
                    });
                    syncStore.createIndex('createdAt', 'created_at', {
                        unique: false,
                    });
                }
            };
        });
    }

    /**
     * Add measurement to offline storage
     */
    async addMeasurement(measurement: MeasurementData): Promise<string> {
        const db = await this.open();
        const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const measurementData = {
            ...measurement,
            localId,
            syncStatus: 'pending',
            createdAt: new Date().toISOString(),
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORES.MEASUREMENTS],
                'readwrite',
            );
            const store = transaction.objectStore(STORES.MEASUREMENTS);
            const request = store.add(measurementData);

            request.onsuccess = () => {
                resolve(localId);
            };

            request.onerror = () => {
                reject(new Error('Failed to add measurement'));
            };
        });
    }

    /**
     * Get all pending measurements
     */
    async getPendingMeasurements(): Promise<MeasurementData[]> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORES.MEASUREMENTS],
                'readonly',
            );
            const store = transaction.objectStore(STORES.MEASUREMENTS);
            const index = store.index('syncStatus');
            const request = index.getAll('pending');

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get pending measurements'));
            };
        });
    }

    /**
     * Update measurement sync status
     */
    async updateMeasurementStatus(
        localId: string,
        status: 'pending' | 'synced' | 'failed',
        serverId?: string,
    ): Promise<void> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORES.MEASUREMENTS],
                'readwrite',
            );
            const store = transaction.objectStore(STORES.MEASUREMENTS);
            const request = store.get(localId);

            request.onsuccess = () => {
                const measurement = request.result;
                if (measurement) {
                    measurement.syncStatus = status;
                    if (serverId) {
                        measurement.serverId = serverId;
                    }
                    measurement.syncedAt = new Date().toISOString();

                    const updateRequest = store.put(measurement);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () =>
                        reject(new Error('Failed to update measurement'));
                } else {
                    reject(new Error('Measurement not found'));
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to get measurement'));
            };
        });
    }

    /**
     * Delete measurement from offline storage
     */
    async deleteMeasurement(localId: string): Promise<void> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORES.MEASUREMENTS],
                'readwrite',
            );
            const store = transaction.objectStore(STORES.MEASUREMENTS);
            const request = store.delete(localId);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to delete measurement'));
            };
        });
    }

    /**
     * Get measurements by child ID
     */
    async getMeasurementsByChild(childId: string): Promise<MeasurementData[]> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORES.MEASUREMENTS],
                'readonly',
            );
            const store = transaction.objectStore(STORES.MEASUREMENTS);
            const index = store.index('childId');
            const request = index.getAll(childId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get measurements'));
            };
        });
    }

    /**
     * Cache child data for offline viewing
     */
    async cacheChild(child: ChildData): Promise<void> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CHILDREN], 'readwrite');
            const store = transaction.objectStore(STORES.CHILDREN);
            const request = store.put(child);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to cache child'));
            };
        });
    }

    /**
     * Cache multiple children at once
     */
    async cacheChildren(children: ChildData[]): Promise<void> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CHILDREN], 'readwrite');
            const store = transaction.objectStore(STORES.CHILDREN);

            let completed = 0;
            const total = children.length;

            if (total === 0) {
                resolve();
                return;
            }

            children.forEach((child) => {
                const request = store.put(child);

                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };

                request.onerror = () => {
                    reject(new Error('Failed to cache children'));
                };
            });
        });
    }

    /**
     * Get cached child by ID
     */
    async getCachedChild(childId: string): Promise<ChildData | null> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CHILDREN], 'readonly');
            const store = transaction.objectStore(STORES.CHILDREN);
            const request = store.get(childId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(new Error('Failed to get cached child'));
            };
        });
    }

    /**
     * Get all cached children
     */
    async getAllCachedChildren(): Promise<ChildData[]> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.CHILDREN], 'readonly');
            const store = transaction.objectStore(STORES.CHILDREN);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get cached children'));
            };
        });
    }

    /**
     * Clear all offline data
     */
    async clearAll(): Promise<void> {
        const db = await this.open();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                [STORES.MEASUREMENTS, STORES.CHILDREN, STORES.SYNC_QUEUE],
                'readwrite',
            );

            // Clear all stores
            transaction.objectStore(STORES.MEASUREMENTS).clear();
            transaction.objectStore(STORES.CHILDREN).clear();
            transaction.objectStore(STORES.SYNC_QUEUE).clear();

            transaction.oncomplete = () => {
                resolve();
            };

            transaction.onerror = () => {
                reject(new Error('Failed to clear offline data'));
            };
        });
    }

    /**
     * Get storage usage statistics
     */
    async getStorageStats(): Promise<{
        measurements: number;
        children: number;
        pendingSync: number;
    }> {
        const db = await this.open();

        const getMeasurementsCount = (): Promise<number> => {
            return new Promise((resolve) => {
                const transaction = db.transaction(
                    [STORES.MEASUREMENTS],
                    'readonly',
                );
                const store = transaction.objectStore(STORES.MEASUREMENTS);
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
            });
        };

        const getChildrenCount = (): Promise<number> => {
            return new Promise((resolve) => {
                const transaction = db.transaction(
                    [STORES.CHILDREN],
                    'readonly',
                );
                const store = transaction.objectStore(STORES.CHILDREN);
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
            });
        };

        const getPendingCount = (): Promise<number> => {
            return new Promise((resolve) => {
                const transaction = db.transaction(
                    [STORES.MEASUREMENTS],
                    'readonly',
                );
                const store = transaction.objectStore(STORES.MEASUREMENTS);
                const index = store.index('syncStatus');
                const request = index.count('pending');
                request.onsuccess = () => resolve(request.result);
            });
        };

        const [measurements, children, pendingSync] = await Promise.all([
            getMeasurementsCount(),
            getChildrenCount(),
            getPendingCount(),
        ]);

        return { measurements, children, pendingSync };
    }

    /**
     * Close database connection
     */
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Export singleton instance
export const offlineDB = new OfflineDB();
