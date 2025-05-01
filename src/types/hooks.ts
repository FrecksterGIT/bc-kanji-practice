import { WanikaniSubject, WanikaniUserData } from './wanikani';

export interface UseWanikaniUserResult {
  user: WanikaniUserData | null;
  loading: boolean;
  refetch: () => void;
}

export interface UserContextType {
  user: WanikaniUserData | null;
  isLoggedIn: boolean;
  maxLevel: number;
  loading: boolean;
  refetch: () => void;
  speak: (text: string) => void;
}

export type ValidationFunction = (input: string) => boolean;

export interface ValidationContextType {
  items: Array<WanikaniSubject>;
  item: WanikaniSubject;
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
