import { WanikaniAssignment, WanikaniUserData } from './wanikani';
import { KanjiItem, VocabularyItem } from './data';

export interface UseWanikaniUserResult {
  user: WanikaniUserData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseWanikaniAssignmentsResult {
  assignments: WanikaniAssignment[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseRelatedVocabularyResult {
  relatedVocabulary: VocabularyItem[];
  loading: boolean;
  error: Error | null;
}

export interface UseKanjiCompositionResult {
  kanjiData: Map<string, KanjiItem>;
  loading: boolean;
  error: Error | null;
}

export interface UseDataFilesResult<T extends KanjiItem | VocabularyItem> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UserContextType {
  user: WanikaniUserData | null;
  isLoggedIn: boolean;
  maxLevel: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  speak: (text: string) => void;
}

export type ValidationFunction = (input: string) => boolean;

export interface ValidationContextType {
  items: Array<KanjiItem | VocabularyItem>;
  item: KanjiItem | VocabularyItem;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  validate: ValidationFunction;
  validItems: number[];
  isValid: boolean;
  moveToNext: () => void;
}

export type MarkedItem = {
  id: number;
  type: 'kanji' | 'vocabulary';
  level: number;
};
