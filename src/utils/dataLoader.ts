// Constants for cache keys
export const KANJI_CACHE_KEY_PREFIX = 'kanji-data-cache-';
export const VOCABULARY_CACHE_KEY_PREFIX = 'vocabulary-data-cache-';
export const PAGE_LOAD_KEY = 'data-files-page-load';

// Type for the data type parameter
export type DataType = 'kanji' | 'vocabulary';

// Interface for cached data
export interface CachedData<T> {
    data: T[];
    timestamp: number;
}

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
 * Gets cached data from localStorage
 * @param cacheKey The cache key for the data
 * @returns The cached data, or null if not found or invalid
 */
export const getCachedData = <T>(cacheKey: string): CachedData<T> | null => {
    const cachedDataString = localStorage.getItem(cacheKey);
    if (!cachedDataString) return null;

    try {
        return JSON.parse(cachedDataString) as CachedData<T>;
    } catch (err) {
        console.error('Error parsing cached data:', err);
        return null;
    }
};

/**
 * Saves data to localStorage cache
 * @param cacheKey The cache key for the data
 * @param data The data to cache
 */
export const saveToCache = <T>(cacheKey: string, data: T[]): void => {
    const cacheData: CachedData<T> = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
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
        const cachedData = getCachedData<T>(cacheKey);
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
        saveToCache(cacheKey, fetchedData);
        console.log(`Loaded ${dataType} data for level ${level}`);
        return fetchedData;
    } catch (err) {
        console.error(`Error loading ${dataType} data for level ${level}:`, err);
        throw err;
    }
};

/**
 * Function to clear all data file caches
 */
export const clearAllDataFileCaches = (): void => {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);

    // Filter keys that start with our cache prefixes
    const cacheKeys = keys.filter(key =>
        key.startsWith(KANJI_CACHE_KEY_PREFIX) ||
        key.startsWith(VOCABULARY_CACHE_KEY_PREFIX)
    );

    // Remove all cache entries
    cacheKeys.forEach(key => localStorage.removeItem(key));

    console.log(`Cleared ${cacheKeys.length} data file cache entries`);
};
