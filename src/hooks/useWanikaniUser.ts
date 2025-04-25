import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { WanikaniUserData, UseWanikaniUserResult } from '../types';
import { WaniKaniApiClient } from '../utils/wanikaniApi';

// Cache key for localStorage
const WANIKANI_USER_CACHE_KEY = 'wanikani-user-cache';
const PAGE_LOAD_KEY = 'wanikani-page-load';
// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Interface for cached data
interface CachedData {
  user: WanikaniUserData;
  timestamp: number;
}

/**
 * Hook to fetch user data from the Wanikani API
 * @returns Object containing user data, loading state, error state, and refetch function
 */
export function useWanikaniUser(): UseWanikaniUserResult {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const [user, setUser] = useState<WanikaniUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Get cached data from localStorage
  const getCachedData = (): CachedData | null => {
    const cachedDataString = localStorage.getItem(WANIKANI_USER_CACHE_KEY);
    if (!cachedDataString) return null;

    try {
      const cachedData = JSON.parse(cachedDataString) as CachedData;

      // Check if cache is expired
      const now = Date.now();
      if (now - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
        console.log('Cache expired, fetching fresh data');
        return null;
      }

      return cachedData;
    } catch (err) {
      console.error('Error parsing cached data:', err);
      return null;
    }
  };

  // Save data to cache
  const saveToCache = (userData: WanikaniUserData) => {
    const cacheData: CachedData = {
      user: userData,
      timestamp: Date.now(),
    };
    localStorage.setItem(WANIKANI_USER_CACHE_KEY, JSON.stringify(cacheData));
  };

  const fetchUserData = useCallback(
    async (forceRefresh = false) => {
      if (!apiKey) {
        setError(new Error('API key is required'));
        setLoading(false);
        return;
      }

      // Check cache first if not forcing a refresh
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setUser(cachedData.user);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const client = new WaniKaniApiClient(apiKey);
        const data = await client.getUser();
        setUser(data.data);
        saveToCache(data.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    [apiKey]
  );

  useEffect(() => {
    if (apiKey) {
      // Force refresh on page reload
      const shouldRefresh = isPageReload();
      fetchUserData(shouldRefresh).then();
    } else {
      setLoading(false);
    }
  }, [apiKey, fetchUserData]);

  return { user, loading, error, refetch: () => fetchUserData(true) };
}
