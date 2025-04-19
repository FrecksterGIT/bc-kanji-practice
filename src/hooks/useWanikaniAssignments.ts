import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

// Cache key for localStorage
const WANIKANI_ASSIGNMENTS_CACHE_KEY_PREFIX = 'wanikani-assignments-cache-';
const PAGE_LOAD_KEY = 'wanikani-assignments-page-load';
// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Define types for the Wanikani API response
interface WanikaniAssignmentsResponse {
  object: string;
  url: string;
  pages: {
    per_page: number;
    next_url: string | null;
    previous_url: string | null;
  };
  total_count: number;
  data_updated_at: string;
  data: WanikaniAssignment[];
}

interface WanikaniAssignment {
  id: number;
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    created_at: string;
    subject_id: number;
    subject_type: string;
    level: number;
    srs_stage: number;
    unlocked_at: string | null;
    started_at: string | null;
    passed_at: string | null;
    burned_at: string | null;
    available_at: string | null;
    resurrected_at: string | null;
    hidden: boolean;
  };
}

// Interface for cached data
interface CachedData {
  assignments: WanikaniAssignment[];
  timestamp: number;
}

// Define the return type for the hook
interface UseWanikaniAssignmentsResult {
  assignments: WanikaniAssignment[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch assignments data from the Wanikani API
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export function useWanikaniAssignments(): UseWanikaniAssignmentsResult {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const level = useSettingsStore((state) => state.level);
  const [assignments, setAssignments] = useState<WanikaniAssignment[] | null>(null);
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

  // Get cache key based on level
  const getCacheKey = () => {
    return `${WANIKANI_ASSIGNMENTS_CACHE_KEY_PREFIX}${level}`;
  };

  // Get cached data from localStorage
  const getCachedData = (): CachedData | null => {
    const cacheKey = getCacheKey();
    const cachedDataString = localStorage.getItem(cacheKey);
    if (!cachedDataString) return null;

    try {
      const cachedData = JSON.parse(cachedDataString) as CachedData;

      // Check if cache is expired
      const now = Date.now();
      if (now - cachedData.timestamp > CACHE_EXPIRATION_TIME) {
        console.log(`Cache expired for assignments level ${level}, fetching fresh data`);
        return null;
      }

      return cachedData;
    } catch (err) {
      console.error('Error parsing cached data:', err);
      return null;
    }
  };

  // Save data to cache
  const saveToCache = (assignmentsData: WanikaniAssignment[]) => {
    const cacheKey = getCacheKey();
    const cacheData: CachedData = {
      assignments: assignmentsData,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  };

  const fetchAssignments = async (forceRefresh = false) => {
    if (!apiKey) {
      setError(new Error('API key is required'));
      return;
    }

    // Check cache first if not forcing a refresh
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setAssignments(cachedData.assignments);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Construct URL with query parameters
      const url = new URL('https://api.wanikani.com/v2/assignments');
      url.searchParams.append('started', 'true');
      url.searchParams.append('levels', level.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Wanikani-Revision': '20170710',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: WanikaniAssignmentsResponse = await response.json();
      setAssignments(data.data);
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
      fetchAssignments(shouldRefresh);
    }
  }, [apiKey, level]);

  return {
    assignments,
    loading,
    error,
    refetch: () => fetchAssignments(true)
  };
}
