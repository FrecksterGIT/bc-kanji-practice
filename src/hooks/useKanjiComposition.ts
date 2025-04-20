import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../utils/db';
import { KanjiItem, UseKanjiCompositionResult } from '../types';

/**
 * Hook to get kanji data for each character in a vocabulary word
 * @param word The vocabulary word to get kanji data for
 * @returns Object containing kanji data, loading state, and error state
 */
export function useKanjiComposition(word: string): UseKanjiCompositionResult {
  const [error, setError] = useState<Error | null>(null);

  // Use Dexie's useLiveQuery to reactively query all kanji data
  const allKanjiData = useLiveQuery(
    async () => {
      try {
        // Get all entries from the kanjiStore
        const entries = await db.kanjiStore.toArray();

        // Extract and flatten all kanji data from all cache entries
        // Use a more efficient approach with reduce
        const allKanji = entries.reduce<KanjiItem[]>((acc, cacheEntry) => {
          if (Array.isArray(cacheEntry?.data)) {
            acc.push(...cacheEntry.data);
          }
          return acc;
        }, []);

        // Create an index map for faster lookups
        const kanjiMap = new Map<string, KanjiItem>();
        allKanji.forEach(item => {
          kanjiMap.set(item.kanji, item);
        });

        return { allKanji, kanjiMap };
      } catch (err: unknown) {
        console.error('Error accessing Dexie database:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        return { allKanji: [], kanjiMap: new Map() };
      }
    },
    // Dependencies array for useLiveQuery
    []
  );

  // Process the kanji data to find matches for the word
  const kanjiData = useLiveQuery(
    () => {
      if (!word || !allKanjiData) {
        return new Map<string, KanjiItem>();
      }

      try {
        const resultMap = new Map<string, KanjiItem>();
        const { kanjiMap } = allKanjiData;

        // Extract unique kanji characters from the vocabulary word
        const uniqueKanji = [...new Set(word.split(''))];

        // Find kanji data for each character using the pre-built map for O(1) lookups
        uniqueKanji.forEach(char => {
          const kanjiItem = kanjiMap.get(char);
          if (kanjiItem) {
            resultMap.set(char, kanjiItem);
          }
        });

        return resultMap;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        return new Map<string, KanjiItem>();
      }
    },
    // Dependencies array for useLiveQuery - recompute when word or allKanjiData changes
    [word, allKanjiData]
  ) || new Map<string, KanjiItem>();

  // Determine loading state
  const loading = allKanjiData === undefined;

  return {
    kanjiData,
    loading,
    error
  };
}
