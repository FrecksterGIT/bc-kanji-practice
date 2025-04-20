import { DataType, CachedData } from '../types';

// Constants for cache keys and IndexedDB
export const KANJI_CACHE_KEY_PREFIX = 'kanji-data-cache-';
export const VOCABULARY_CACHE_KEY_PREFIX = 'vocabulary-data-cache-';
export const PAGE_LOAD_KEY = 'data-files-page-load';
export const DB_NAME = 'kanji-practice-db';
export const DB_VERSION = 1;
export const KANJI_STORE = 'kanji-store';
export const VOCABULARY_STORE = 'vocabulary-store';

/**
 * Opens the IndexedDB database
 * @returns A promise that resolves to the database instance
 */
export const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event);
            reject(new Error('Could not open IndexedDB'));
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(KANJI_STORE)) {
                db.createObjectStore(KANJI_STORE);
            }

            if (!db.objectStoreNames.contains(VOCABULARY_STORE)) {
                db.createObjectStore(VOCABULARY_STORE);
            }
        };
    });
};

/**
 * Checks if this is a page reload
 * @param pageLoadKey The key to use for checking page load in sessionStorage
 * @returns True if this is a page reload, false otherwise
 */
export const isPageReload = (pageLoadKey: string): boolean => {
    const pageLoad = sessionStorage.getItem(pageLoadKey);
    if (!pageLoad) {
        sessionStorage.setItem(pageLoadKey, '1');
        return true;
    }
    return false;
};

/**
 * Gets the cache key for a data file
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @param level The level of the data
 * @returns The cache key for the data file
 */
export const getCacheKey = (dataType: DataType, level: number): string => {
    const prefix = dataType === 'kanji' ? KANJI_CACHE_KEY_PREFIX : VOCABULARY_CACHE_KEY_PREFIX;
    return `${prefix}${level}`;
};

/**
 * Gets the store name for a data type
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @returns The store name for the data type
 */
export const getStoreName = (dataType: DataType): string => {
    return dataType === 'kanji' ? KANJI_STORE : VOCABULARY_STORE;
};

/**
 * Gets cached data from IndexedDB
 * @param cacheKey The cache key for the data
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @returns A promise that resolves to the cached data, or null if not found or invalid
 */
export const getCachedData = async <T>(cacheKey: string, dataType: DataType): Promise<CachedData<T> | null> => {
    try {
        const db = await openDatabase();
        const storeName = getStoreName(dataType);

        return new Promise<CachedData<T> | null>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(cacheKey);

            request.onerror = (event) => {
                console.error('Error getting cached data:', event);
                db.close();
                reject(new Error('Failed to get cached data'));
            };

            request.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result as CachedData<T> | undefined;
                db.close();
                resolve(result || null);
            };
        });
    } catch (err) {
        console.error('Error accessing IndexedDB:', err);
        return null;
    }
};

/**
 * Saves data to IndexedDB cache
 * @param cacheKey The cache key for the data
 * @param data The data to cache
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @returns A promise that resolves when the data is saved
 */
export const saveToCache = async <T>(cacheKey: string, data: T[], dataType: DataType): Promise<void> => {
    const cacheData: CachedData<T> = {
        data,
        timestamp: Date.now()
    };

    try {
        const db = await openDatabase();
        const storeName = getStoreName(dataType);

        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(cacheData, cacheKey);

            request.onerror = (event) => {
                console.error('Error saving to cache:', event);
                db.close();
                reject(new Error('Failed to save to cache'));
            };

            request.onsuccess = () => {
                db.close();
                resolve();
            };
        });
    } catch (err) {
        console.error('Error accessing IndexedDB:', err);
    }
};

/**
 * Loads data from a file, with caching
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @param level The level of the data
 * @param forceRefresh Whether to force a refresh from the server
 * @returns A promise that resolves to the loaded data
 */
export const loadDataFile = async <T>(
    dataType: DataType,
    level: number,
    forceRefresh = false
): Promise<T[]> => {
    const cacheKey = getCacheKey(dataType, level);

    // Check cache first if not forcing a refresh
    if (!forceRefresh) {
        const cachedData = await getCachedData<T>(cacheKey, dataType);
        if (cachedData) {
            return cachedData.data;
        }
    }

    try {
        const fileName = `${dataType}${level}.json`;
        const response = await fetch(`/data/${fileName}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedData: T[] = await response.json();
        await saveToCache(cacheKey, fetchedData, dataType);
        console.log(`Loaded ${dataType} data for level ${level}`);
        return fetchedData;
    } catch (err) {
        console.error(`Error loading ${dataType} data for level ${level}:`, err);
        throw err;
    }
};

/**
 * Function to clear all data file caches from IndexedDB
 * @returns A promise that resolves when all caches are cleared
 */
export const clearAllDataFileCaches = async (): Promise<void> => {
    try {
        const db = await openDatabase();

        // Clear both stores
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([KANJI_STORE, VOCABULARY_STORE], 'readwrite');

            // Clear kanji store
            const kanjiStore = transaction.objectStore(KANJI_STORE);
            kanjiStore.clear();

            // Clear vocabulary store
            const vocabStore = transaction.objectStore(VOCABULARY_STORE);
            vocabStore.clear();

            transaction.oncomplete = () => {
                console.log('Cleared all data file cache entries from IndexedDB');
                db.close();
                resolve();
            };

            transaction.onerror = (event) => {
                console.error('Error clearing IndexedDB caches:', event);
                db.close();
                reject(new Error('Failed to clear caches'));
            };
        });
    } catch (err) {
        console.error('Error accessing IndexedDB:', err);
    }

    // Also clear any legacy localStorage caches
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key =>
        key.startsWith(KANJI_CACHE_KEY_PREFIX) ||
        key.startsWith(VOCABULARY_CACHE_KEY_PREFIX)
    );
    cacheKeys.forEach(key => localStorage.removeItem(key));
    if (cacheKeys.length > 0) {
        console.log(`Cleared ${cacheKeys.length} legacy localStorage cache entries`);
    }
};

/**
 * Migrates data from localStorage to IndexedDB if needed
 * This is called automatically when the module is loaded
 */
export const migrateFromLocalStorage = async (): Promise<void> => {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key =>
        key.startsWith(KANJI_CACHE_KEY_PREFIX) ||
        key.startsWith(VOCABULARY_CACHE_KEY_PREFIX)
    );

    if (cacheKeys.length === 0) return;

    console.log(`Migrating ${cacheKeys.length} cache entries from localStorage to IndexedDB...`);

    for (const key of cacheKeys) {
        try {
            const cachedDataString = localStorage.getItem(key);
            if (!cachedDataString) continue;

            const cachedData = JSON.parse(cachedDataString);
            const dataType: DataType = key.startsWith(KANJI_CACHE_KEY_PREFIX) ? 'kanji' : 'vocabulary';

            await saveToCache(key, cachedData.data, dataType);
            localStorage.removeItem(key);
        } catch (err) {
            console.error(`Error migrating cache entry ${key}:`, err);
        }
    }

    console.log('Migration from localStorage to IndexedDB complete');
};

// Attempt to migrate data when the module is loaded
migrateFromLocalStorage().catch(err => {
    console.error('Error during migration from localStorage to IndexedDB:', err);
});
