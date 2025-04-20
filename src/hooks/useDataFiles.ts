import {useState, useEffect, useCallback} from 'react';
import {useSettingsStore} from '../store/settingsStore';
import {loadDataFile, isPageReload} from '../utils/dataLoader';
import {DataType, KanjiItem, VocabularyItem, UseDataFilesResult} from '../types';

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
