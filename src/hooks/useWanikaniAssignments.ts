import {useState, useEffect, useCallback} from 'react';
import {useSettingsStore} from '../store/settingsStore';
import {
    WanikaniAssignment,
    UseWanikaniAssignmentsResult
} from '../types';
import {WaniKaniApiClient} from '../utils/wanikaniApi';

// Cache key for localStorage
const WANIKANI_ASSIGNMENTS_CACHE_KEY_PREFIX = 'wanikani-assignments-cache-';
const PAGE_LOAD_KEY = 'wanikani-assignments-page-load';
// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Interface for cached data
interface CachedData {
    assignments: WanikaniAssignment[];
    timestamp: number;
}

/**
 * Hook to fetch assignments data from the Wanikani API
 * @param subjectType - The type of subjects to fetch: 'kanji' or 'vocabulary'
 * @returns Object containing assignments data, loading state, error state, and refetch function
 */
export function useWanikaniAssignments(subjectType: 'kanji' | 'vocabulary' = 'kanji'): UseWanikaniAssignmentsResult {
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

    // Get cache key based on level and subject type
    const getCacheKey = useCallback(() => {
        return `${WANIKANI_ASSIGNMENTS_CACHE_KEY_PREFIX}${level}-${subjectType}`;
    }, [level, subjectType]);

    // Get cached data from localStorage
    const getCachedData = useCallback((): CachedData | null => {
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
    }, [getCacheKey, level]);

    // Helper function to convert string date to Date object
    const convertToDate = (dateString: string | null): Date | null => {
        if (!dateString || dateString === '') {
            return null;
        }
        return new Date(dateString);
    };

    // Save data to cache
    const saveToCache = useCallback((assignmentsData: WanikaniAssignment[]) => {
        const cacheKey = getCacheKey();
        const cacheData: CachedData = {
            assignments: assignmentsData,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }, [getCacheKey]);

    const fetchAssignments = useCallback(async (forceRefresh = false) => {
        if (!apiKey) {
            setError(new Error('API key is required'));
            return;
        }

        // Check cache first if not forcing a refresh
        if (!forceRefresh) {
            const cachedData = getCachedData();
            if (cachedData) {
                // Convert date strings to Date objects
                const processedAssignments = cachedData.assignments.map(assignment => ({
                    ...assignment,
                    data: {
                        ...assignment.data,
                        created_at: convertToDate(assignment.data.created_at as unknown as string),
                        unlocked_at: convertToDate(assignment.data.unlocked_at as unknown as string),
                        started_at: convertToDate(assignment.data.started_at as unknown as string),
                        passed_at: convertToDate(assignment.data.passed_at as unknown as string),
                        burned_at: convertToDate(assignment.data.burned_at as unknown as string),
                        available_at: convertToDate(assignment.data.available_at as unknown as string)
                    }
                }));
                setAssignments(processedAssignments);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const client = new WaniKaniApiClient(apiKey);

            // Set up parameters for the API call
            const params: {
                started: boolean;
                level: number;
                subject_types: string;
            } = {
                started: true,
                level: level,
                subject_types: subjectType === 'kanji' ? 'kanji' : 'vocabulary,kana_vocabulary'
            };

            // Get assignments using the client
            const response = await client.getAssignments(params);

            // The response could be either WanikaniAssignmentsResponse or WanikaniAssignment[]
            // We need to handle both cases
            const assignmentsData = Array.isArray(response) ? response : response.data;

            // Convert date strings to Date objects
            const processedAssignments = assignmentsData.map(assignment => ({
                ...assignment,
                data: {
                    ...assignment.data,
                    created_at: convertToDate(assignment.data.created_at?.toString() ?? null),
                    unlocked_at: convertToDate(assignment.data.unlocked_at?.toString() ?? null),
                    started_at: convertToDate(assignment.data.started_at?.toString() ?? null),
                    passed_at: convertToDate(assignment.data.passed_at?.toString() ?? null),
                    burned_at: convertToDate(assignment.data.burned_at?.toString() ?? null),
                    available_at: convertToDate(assignment.data.available_at?.toString() ?? null),
                }
            }));

            setAssignments(processedAssignments);
            saveToCache(processedAssignments);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [apiKey, getCachedData, level, saveToCache, subjectType]);

    useEffect(() => {
        if (apiKey) {
            // Force refresh on page reload
            const shouldRefresh = isPageReload();
            fetchAssignments(shouldRefresh).then();
        }
    }, [apiKey, fetchAssignments, level, subjectType]);

    return {
        assignments,
        loading,
        error,
        refetch: () => fetchAssignments(true)
    };
}
