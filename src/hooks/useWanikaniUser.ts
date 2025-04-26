import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { WanikaniUserData, UseWanikaniUserResult } from '../types';
import { WaniKaniApiClient } from '../utils/wanikaniApi';

const WANIKANI_USER_CACHE_KEY = 'wanikani-user-cache';
const PAGE_LOAD_KEY = 'wanikani-page-load';
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

interface CachedData {
  user: WanikaniUserData;
  timestamp: number;
}

/**
 * Hook to fetch user data from the Wanikani API
 * @returns Object containing user data, loading state, error state, and refetch function
 */
function useWanikaniUser(): UseWanikaniUserResult {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const [user, setUser] = useState<WanikaniUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isPageReload = () => {
    const pageLoad = sessionStorage.getItem(PAGE_LOAD_KEY);
    if (!pageLoad) {
      sessionStorage.setItem(PAGE_LOAD_KEY, '1');
      return true;
    }
    return false;
  };

  const getCachedData = (): CachedData | null => {
    const cachedDataString = localStorage.getItem(WANIKANI_USER_CACHE_KEY);
    if (!cachedDataString) return null;

    try {
      const cachedData = JSON.parse(cachedDataString) as CachedData;

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
      const shouldRefresh = isPageReload();
      fetchUserData(shouldRefresh).then();
    } else {
      setLoading(false);
    }
  }, [apiKey, fetchUserData]);

  return { user, loading, error, refetch: () => fetchUserData(true) };
}

export default useWanikaniUser;
