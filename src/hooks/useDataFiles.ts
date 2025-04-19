import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

// Cache keys for localStorage
const KANJI_CACHE_KEY_PREFIX = 'kanji-data-cache-';
const VOCABULARY_CACHE_KEY_PREFIX = 'vocabulary-data-cache-';
const PAGE_LOAD_KEY = 'data-files-page-load';

// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Define types for the data
interface KanjiItem {
  id: number;
  level: number;
  kanji: string;
  // Add other properties as needed
}

interface VocabularyItem {
  id: number;
  level: number;
  word: string;
  // Add other properties as needed
}

// Type for the data type parameter
type DataType = 'kanji' | 'vocabulary';

// Interface for cached data
interface CachedData<T> {
  data: T[];
  timestamp: number;
}

// Define the return type for the hook
interface UseDataFilesResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch data files from the public data folder
 * @param dataType The type of data to fetch ('kanji' or 'vocabulary')
 * @returns Object containing data, loading state, error state, and refetch function
 */
export function useDataFiles<T extends KanjiItem | VocabularyItem>(
  dataType: DataType
): UseDataFilesResult<T> {
  const level = useSettingsStore((state) => state.level);
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if this is a page reload
  const isPageReload = () => {
    const pageLoad = sessionStorage.getItem(PAGE_LOAD_KEY);
    if (!pageLoad) {
      sessionStorage.setItem(PAGE_LOAD_KEY, '1');
      return true;
    }
    return false;
  };

  // Get cache key based on data type and level
  const getCacheKey = () => {
    const prefix = dataType === 'kanji' ? KANJI_CACHE_KEY_PREFIX : VOCABULARY_CACHE_KEY_PREFIX;
    return `${prefix}${level}`;
  };

  // Get cached data from localStorage
  const getCachedData = (): CachedData<T> | null => {
    const cacheKey = getCacheKey();
    const cachedDataString = localStorage.getItem(cacheKey);
    if (!cachedDataString) return null;

    try {
      const cachedData = JSON.parse(cachedDataString) as CachedData<T>;

      // Check if cache is expired
      const now = Date.now();
      if (now - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
        console.log(`Cache expired for ${dataType} level ${level}, fetching fresh data`);
        return null;
      }

      return cachedData;
    } catch (err) {
      console.error('Error parsing cached data:', err);
      return null;
    }
  };

  // Save data to cache
  const saveToCache = (dataToCache: T[]) => {
    const cacheKey = getCacheKey();
    const cacheData: CachedData<T> = {
      data: dataToCache,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  const fetchData = async (forceRefresh = false) => {
    // Check cache first if not forcing a refresh
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const fileName = `${dataType}${level}.json`;
      const response = await fetch(`/data/${fileName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const fetchedData: T[] = await response.json();
      setData(fetchedData);
      saveToCache(fetchedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force refresh on page reload
    const shouldRefresh = isPageReload();
    fetchData(shouldRefresh);
  }, [dataType, level]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true)
  };
}
