import {useState, useEffect} from 'react';
import {openDatabase, getStoreName} from '../utils/dataLoader';
import {VocabularyItem, UseRelatedVocabularyResult} from '../types';

/**
 * Gets all vocabulary data from IndexedDB
 * @returns A promise that resolves to all vocabulary data
 */
const getAllVocabularyData = async (): Promise<VocabularyItem[]> => {
    try {
        const db = await openDatabase();
        const storeName = getStoreName('vocabulary');

        return new Promise<VocabularyItem[]>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = (event) => {
                console.error('Error getting vocabulary data:', event);
                db.close();
                reject(new Error('Failed to get vocabulary data'));
            };

            request.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result;
                db.close();

                // Extract and flatten all vocabulary data from all cache entries
                const allVocabulary: VocabularyItem[] = [];
                if (result && Array.isArray(result)) {
                    result.forEach(cacheEntry => {
                        if (Array.isArray(cacheEntry?.data)) {
                            allVocabulary.push(...cacheEntry.data);
                        }
                    });
                }

                resolve(allVocabulary);
            };
        });
    } catch (err) {
        console.error('Error accessing IndexedDB:', err);
        return [];
    }
};

/**
 * Hook to get vocabulary that contains a specific kanji
 * @param kanji The kanji character to filter by
 * @returns Object containing related vocabulary, loading state, and error state
 */
export function useRelatedVocabulary(kanji: string): UseRelatedVocabularyResult {
    const [relatedVocabulary, setRelatedVocabulary] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!kanji) {
                setRelatedVocabulary([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const allVocabulary = await getAllVocabularyData();

                // Filter vocabulary that contains the kanji
                const filtered = allVocabulary.filter(item => item.word.includes(kanji));

                // Sort by vocabulary level
                const sorted = filtered.sort((a, b) => a.level - b.level);

                setRelatedVocabulary(sorted);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [kanji]);

    return {
        relatedVocabulary,
        loading,
        error
    };
}
