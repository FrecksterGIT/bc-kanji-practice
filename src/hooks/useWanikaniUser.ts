import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

// Cache key for localStorage
const WANIKANI_USER_CACHE_KEY = 'wanikani-user-cache';
const PAGE_LOAD_KEY = 'wanikani-page-load';
// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Define types for the Wanikani API response
interface WanikaniUserResponse {
  object: string;
  url: string;
  data_updated_at: string;
  data: WanikaniUserData;
}

interface WanikaniUserData {
  id: string;
  username: string;
  level: number;
  profile_url: string;
  started_at: string;
  current_vacation_started_at: string | null;
  subscription: WanikaniSubscription;
  preferences: WanikaniPreferences;
}

interface WanikaniSubscription {
  active: boolean;
  type: string;
  max_level_granted: number;
  period_ends_at: string;
}

interface WanikaniPreferences {
  default_voice_actor_id: number;
  extra_study_autoplay_audio: boolean;
  lessons_autoplay_audio: boolean;
  lessons_batch_size: number;
  lessons_presentation_order: string;
  reviews_autoplay_audio: boolean;
  reviews_display_srs_indicator: boolean;
  reviews_presentation_order: string;
}

// Interface for cached data
interface CachedData {
  user: WanikaniUserData;
  timestamp: number;
}

// Define the return type for the hook
interface UseWanikaniUserResult {
  user: WanikaniUserData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch user data from the Wanikani API
 * @returns Object containing user data, loading state, error state, and refetch function
 */
export function useWanikaniUser(): UseWanikaniUserResult {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const [user, setUser] = useState<WanikaniUserData | null>(null);
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
      timestamp: Date.now()
    };
    localStorage.setItem(WANIKANI_USER_CACHE_KEY, JSON.stringify(cacheData));
  };

  const fetchUserData = async (forceRefresh = false) => {
    if (!apiKey) {
      setError(new Error('API key is required'));
      return;
    }

    // Check cache first if not forcing a refresh
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setUser(cachedData.user);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.wanikani.com/v2/user', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Wanikani-Revision': '20170710',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: WanikaniUserResponse = await response.json();
      setUser(data.data);
      saveToCache(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      // Force refresh on page reload
      const shouldRefresh = isPageReload();
      fetchUserData(shouldRefresh);
    }
  }, [apiKey]);

  return { user, loading, error, refetch: () => fetchUserData(true) };
}
