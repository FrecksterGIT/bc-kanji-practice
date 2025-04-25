import Dexie, { Table } from 'dexie';
import { KanjiItem, VocabularyItem, CachedData } from '../types';

export class KanjiPracticeDB extends Dexie {
  kanjiStore!: Table<CachedData<KanjiItem>>;
  vocabularyStore!: Table<CachedData<VocabularyItem>>;

  constructor() {
    super('kanji-practice-db');

    this.version(1).stores({
      kanjiStore: '',
      vocabularyStore: '',
    });
  }
}

export const db = new KanjiPracticeDB();

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
