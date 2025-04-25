export type DataType = 'kanji' | 'vocabulary';

export interface KanjiItem {
  id: number;
  level: number;
  kanji: string;
  onyomi: {
    reading: string;
    primary: boolean;
    accepted_answer: boolean;
    type: string;
  }[];
  kunyomi: {
    reading: string;
    primary: boolean;
    accepted_answer: boolean;
    type: string;
  }[];
  meanings: {
    meaning: string;
    primary: boolean;
    accepted_answer: boolean;
  }[];
  meaning_mnemonic: string;
  meaning_hint: string;
  reading_mnemonic: string;
  reading_hint: string;
  vocabulary: Array<{
    word: string;
    level: number;
    meaning: string;
    reading: string;
  }>;
}

export interface VocabularyItem {
  id: number;
  level: number;
  word: string;
  reading: {
    reading: string;
    primary: boolean;
  }[];
  meanings: {
    meaning: string;
    primary: boolean;
  }[];
  reading_mnemonic: string;
}

// Interface for cached data
export interface CachedData<T> {
  data: T[];
  timestamp: number;
}
