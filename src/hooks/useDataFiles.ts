import {useState, useEffect, useCallback} from 'react';
import {useSettingsStore} from '../store/settingsStore';
import {
    loadDataFile,
    isPageReload,
    clearAllDataFileCaches as clearCaches,
    DataType
} from '../utils/dataLoader';

// Re-export the clearAllDataFileCaches function
export const clearAllDataFileCaches = clearCaches;

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

    const fetchData = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            // Use the unified loadDataFile function from utils
            const fetchedData = await loadDataFile<T>(dataType, level, forceRefresh);
            setData(fetchedData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [dataType, level]);

    useEffect(() => {
        // Force refresh on page reload
        const shouldRefresh = isPageReload('data-files-page-load');
        fetchData(shouldRefresh).then();
    }, [dataType, fetchData, level]);

    return {
        data,
        loading,
        error,
        refetch: () => fetchData(true)
    };
}
