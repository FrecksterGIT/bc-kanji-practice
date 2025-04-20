import {useState, useEffect} from 'react';
import {openDatabase, getStoreName} from '../utils/dataLoader';
import {KanjiItem, UseKanjiCompositionResult} from '../types';

/**
 * Gets all kanji data from IndexedDB
 * @returns A promise that resolves to all kanji data
 */
const getAllKanjiData = async (): Promise<KanjiItem[]> => {
    try {
        const db = await openDatabase();
        const storeName = getStoreName('kanji');

        return new Promise<KanjiItem[]>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onerror = (event) => {
                console.error('Error getting kanji data:', event);
                db.close();
                reject(new Error('Failed to get kanji data'));
            };

            request.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result;
                db.close();

                // Extract and flatten all kanji data from all cache entries
                const allKanji: KanjiItem[] = [];
                if (result && Array.isArray(result)) {
                    result.forEach(cacheEntry => {
                        if (Array.isArray(cacheEntry?.data)) {
                            allKanji.push(...cacheEntry.data);
                        }
                    });
                }

                resolve(allKanji);
            };
        });
    } catch (err) {
        console.error('Error accessing IndexedDB:', err);
        return [];
    }
};

/**
 * Hook to get kanji data for each character in a vocabulary word
 * @param word The vocabulary word to get kanji data for
 * @returns Object containing kanji data, loading state, and error state
 */
export function useKanjiComposition(word: string): UseKanjiCompositionResult {
    const [kanjiData, setKanjiData] = useState<Map<string, KanjiItem>>(new Map());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!word) {
                setKanjiData(new Map());
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const allKanjiData = await getAllKanjiData();
                const kanjiMap = new Map<string, KanjiItem>();

                // Extract unique kanji characters from the vocabulary word
                const uniqueKanji = [...new Set(word.split(''))];

                // Find kanji data for each character
                uniqueKanji.forEach(char => {
                    const kanjiItem = allKanjiData.find(item => item.kanji === char);
                    if (kanjiItem) {
                        kanjiMap.set(char, kanjiItem);
                    }
                });

                setKanjiData(kanjiMap);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [word]);

    return {
        kanjiData,
        loading,
        error
    };
}
