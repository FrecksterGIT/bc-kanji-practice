import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { WanikaniAssignment, UseWanikaniAssignmentsResult } from '../types';
import { WaniKaniApiClient } from '../utils/wanikaniApi';

const WANIKANI_ASSIGNMENTS_CACHE_KEY_PREFIX = 'wanikani-assignments-cache-';
const PAGE_LOAD_KEY = 'wanikani-assignments-page-load';
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

interface CachedData {
  assignments: WanikaniAssignment[];
  timestamp: number;
}

/**
 * Hook to fetch assignments data from the Wanikani API
 * @param subjectType - The type of subjects to fetch: 'kanji' or 'vocabulary'
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
function useWanikaniAssignments(
  subjectType: 'kanji' | 'vocabulary' = 'kanji'
): UseWanikaniAssignmentsResult {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const level = useSettingsStore((state) => state.level);
  const [assignments, setAssignments] = useState<WanikaniAssignment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isPageReload = () => {
    const pageLoad = sessionStorage.getItem(PAGE_LOAD_KEY);
    if (!pageLoad) {
      sessionStorage.setItem(PAGE_LOAD_KEY, '1');
      return true;
    }
    return false;
  };

  const getCacheKey = useCallback(() => {
    return `${WANIKANI_ASSIGNMENTS_CACHE_KEY_PREFIX}${level}-${subjectType}`;
  }, [level, subjectType]);

  const getCachedData = useCallback((): CachedData | null => {
    const cacheKey = getCacheKey();
    const cachedDataString = localStorage.getItem(cacheKey);
    if (!cachedDataString) return null;

    try {
      const cachedData = JSON.parse(cachedDataString) as CachedData;

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
  }, [getCacheKey, level]);

  const convertToDate = (dateString: Date | string | null): Date | null => {
    if (!dateString || dateString === '') {
      return null;
    }
    return new Date(dateString);
  };

  const saveToCache = useCallback(
    (assignmentsData: WanikaniAssignment[]) => {
      const cacheKey = getCacheKey();
      const cacheData: CachedData = {
        assignments: assignmentsData,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    },
    [getCacheKey]
  );

  const fetchAssignments = useCallback(
    async (forceRefresh = false) => {
      if (!apiKey) {
        setError(new Error('API key is required'));
        return;
      }

      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          const processedAssignments = cachedData.assignments.map((assignment) => ({
            ...assignment,
            data: {
              ...assignment.data,
              created_at: convertToDate(assignment.data.created_at),
              unlocked_at: convertToDate(assignment.data.unlocked_at),
              started_at: convertToDate(assignment.data.started_at),
              passed_at: convertToDate(assignment.data.passed_at),
              burned_at: convertToDate(assignment.data.burned_at),
              available_at: convertToDate(assignment.data.available_at),
            },
          }));
          setAssignments(processedAssignments);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const client = new WaniKaniApiClient(apiKey);

        const params: {
          started: boolean;
          levels: number[];
          subject_types: string[];
        } = {
          started: true,
          levels: [level],
          subject_types: subjectType === 'kanji' ? ['kanji'] : ['vocabulary', 'kana_vocabulary'],
        };

        const response = await client.getAssignments(params);

        const assignmentsData = Array.isArray(response) ? response : response.data;

        const processedAssignments = assignmentsData.map((assignment) => ({
          ...assignment,
          data: {
            ...assignment.data,
            created_at: convertToDate(assignment.data.created_at),
            unlocked_at: convertToDate(assignment.data.unlocked_at),
            started_at: convertToDate(assignment.data.started_at),
            passed_at: convertToDate(assignment.data.passed_at),
            burned_at: convertToDate(assignment.data.burned_at),
            available_at: convertToDate(assignment.data.available_at),
          },
        }));

        setAssignments(processedAssignments);
        saveToCache(processedAssignments);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    },
    [apiKey, getCachedData, level, saveToCache, subjectType]
  );

  useEffect(() => {
    if (apiKey) {
      const shouldRefresh = isPageReload();
      fetchAssignments(shouldRefresh).then();
    }
  }, [apiKey, fetchAssignments, level, subjectType]);

  return {
    assignments,
    loading,
    error,
    refetch: () => fetchAssignments(true),
  };
}

export default useWanikaniAssignments;
