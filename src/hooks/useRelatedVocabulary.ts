import {useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../utils/db';
import {VocabularyItem, UseRelatedVocabularyResult} from '../types';

/**
 * Hook to get vocabulary that contains a specific kanji
 * @param kanji The kanji character to filter by
 * @returns Object containing related vocabulary, loading state, and error state
 */
export function useRelatedVocabulary(kanji: string): UseRelatedVocabularyResult {
    const [error, setError] = useState<Error | null>(null);

    // Use Dexie's useLiveQuery to reactively query all vocabulary data
    const allVocabularyData = useLiveQuery(
        async () => {
            try {
                // Get all entries from the vocabularyStore
                const entries = await db.vocabularyStore.toArray();

                // Extract and flatten all vocabulary data from all cache entries
                // Use a more efficient approach with reduce
                const allVocabulary = entries.reduce<VocabularyItem[]>((acc, cacheEntry) => {
                    if (Array.isArray(cacheEntry?.data)) {
                        acc.push(...cacheEntry.data);
                    }
                    return acc;
                }, []);

                // Create an index for faster filtering
                // Group vocabulary by kanji characters they contain
                const kanjiIndex = new Map<string, VocabularyItem[]>();

                allVocabulary.forEach(item => {
                    // For each character in the word
                    [...new Set(item.word.split(''))].forEach(char => {
                        if (!kanjiIndex.has(char)) {
                            kanjiIndex.set(char, []);
                        }
                        kanjiIndex.get(char)?.push(item);
                    });
                });

                return {allVocabulary, kanjiIndex};
            } catch (err: unknown) {
                console.error('Error accessing Dexie database:', err);
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
                return {allVocabulary: [], kanjiIndex: new Map()};
            }
        },
        // Dependencies array for useLiveQuery
        []
    );

    // Process the vocabulary data to find items containing the kanji
    const relatedVocabulary = useLiveQuery(
        () => {
            if (!kanji || !allVocabularyData) {
                return [];
            }

            try {
                // Get vocabulary items directly from the index - O(1) lookup
                const filtered: VocabularyItem[] = allVocabularyData.kanjiIndex.get(kanji) ?? [];

                // Sort by vocabulary level
                return filtered.toSorted((a, b) => a.level - b.level);
            } catch (err: unknown) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
                return [];
            }
        },
        // Dependencies array for useLiveQuery - recompute when kanji or allVocabularyData changes
        [kanji, allVocabularyData]
    ) || [];

    // Determine loading state
    const loading = allVocabularyData === undefined;

    return {
        relatedVocabulary,
        loading,
        error
    };
}
