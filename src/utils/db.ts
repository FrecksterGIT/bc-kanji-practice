import Dexie, { Table } from 'dexie';
import { KanjiItem, VocabularyItem, CachedData } from '../types';

// Database class
export class KanjiPracticeDB extends Dexie {
  // Tables
  kanjiStore!: Table<CachedData<KanjiItem>>;
  vocabularyStore!: Table<CachedData<VocabularyItem>>;

  constructor() {
    super('kanji-practice-db');

    // Define tables and schema
    this.version(1).stores({
      kanjiStore: '', // Primary key is provided when putting data
      vocabularyStore: '', // Primary key is provided when putting data
    });
  }
}

// Create and export a single instance of the database
export const db = new KanjiPracticeDB();

// Constants for cache keys
export const KANJI_CACHE_KEY_PREFIX = 'kanji-data-cache-';
export const VOCABULARY_CACHE_KEY_PREFIX = 'vocabulary-data-cache-';

/**
 * Checks if this is a page reload
 * @param pageLoadKey The key to use for checking page load in sessionStorage
 * @returns True if this is a page reload, false otherwise
 */
export const isPageReload = (pageLoadKey: string): boolean => {
  const pageLoad = sessionStorage.getItem(pageLoadKey);
  if (!pageLoad) {
    sessionStorage.setItem(pageLoadKey, '1');
    return true;
  }
  return false;
};

/**
 * Gets the cache key for a data file
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @param level The level of the data
 * @returns The cache key for the data file
 */
export const getCacheKey = (dataType: 'kanji' | 'vocabulary', level: number): string => {
  const prefix = dataType === 'kanji' ? KANJI_CACHE_KEY_PREFIX : VOCABULARY_CACHE_KEY_PREFIX;
  return `${prefix}${level}`;
};

/**
 * Gets the store table for a data type
 * @param dataType The type of data ('kanji' or 'vocabulary')
 * @returns The store table for the data type
 */
export const getStoreTable = <T extends KanjiItem | VocabularyItem>(
  dataType: 'kanji' | 'vocabulary'
): Table<CachedData<T>> => {
  return (dataType === 'kanji' ? db.kanjiStore : db.vocabularyStore) as Table<CachedData<T>>;
};
