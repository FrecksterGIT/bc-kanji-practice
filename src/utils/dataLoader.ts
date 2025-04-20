import {DataType, CachedData, KanjiItem, VocabularyItem} from '../types';
import {db, getCacheKey, isPageReload, getStoreTable} from './db';

/**
 * Checks if this is a page reload (re-exported from db.ts)
 * @param pageLoadKey The key to use for checking page load in sessionStorage
 * @returns True if this is a page reload, false otherwise
 */
export {isPageReload};

/**
 * Gets the cache key for a data file (re-exported from db.ts)
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @param level The level of the data
 * @returns The cache key for the data file
 */
export {getCacheKey};

/**
 * Gets cached data from Dexie
 * @param cacheKey The cache key for the data
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @returns A promise that resolves to the cached data, or null if not found or invalid
 */
export const getCachedData = async <T extends KanjiItem | VocabularyItem>(cacheKey: string, dataType: DataType): Promise<CachedData<T> | null> => {
    try {
        const table = getStoreTable<T>(dataType);
        const result = await table.get(cacheKey);
        return result || null;
    } catch (err: unknown) {
        console.error('Error accessing Dexie database:', err);
        return null;
    }
};

/**
 * Saves data to Dexie cache
 * @param cacheKey The cache key for the data
 * @param data The data to cache
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @returns A promise that resolves when the data is saved
 */
export const saveToCache = async <T extends KanjiItem | VocabularyItem>(cacheKey: string, data: T[], dataType: DataType): Promise<void> => {
    const cacheData: CachedData<T> = {
        data,
        timestamp: Date.now()
    };

    try {
        const table = getStoreTable<T>(dataType);
        await table.put(cacheData, cacheKey);
    } catch (err: unknown) {
        console.error('Error saving to Dexie cache:', err);
    }
};

/**
 * Loads data from a file, with caching
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @param level The level of the data
 * @param forceRefresh Whether to force a refresh from the server
 * @returns A promise that resolves to the loaded data
 */
export const loadDataFile = async <T extends KanjiItem | VocabularyItem>(
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

    const fileName = `${dataType}${level}.json`;
    const response = await fetch(`/data/${fileName}`);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    try {
        const fetchedData: T[] = await response.json();
        await saveToCache(cacheKey, fetchedData, dataType);
        console.log(`Loaded ${dataType} data for level ${level}`);
        return fetchedData;
    } catch (err: unknown) {
        console.error(`Error loading ${dataType} data for level ${level}:`, err);
        throw err;
    }
};

/**
 * Function to clear all data file caches from Dexie
 * @returns A promise that resolves when all caches are cleared
 */
export const clearAllDataFileCaches = async (): Promise<void> => {
    try {
        // Clear both stores
        await db.transaction('rw', [db.kanjiStore, db.vocabularyStore], async () => {
            await db.kanjiStore.clear();
            await db.vocabularyStore.clear();
        });

        console.log('Cleared all data file cache entries from Dexie database');
    } catch (err: unknown) {
        console.error('Error clearing Dexie caches:', err);
    }
};
