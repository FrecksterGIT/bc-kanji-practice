import { createContext } from 'react';
import { WanikaniUserData } from '../wanikani';

export enum SortSetting {
  'id' = 'id',
  'nextReview' = 'nextReview',
  'randomize' = 'randomize',
}

export type PersistedSettings = {
  apiKey: string;
  limitToLearned: boolean;
  limitToCurrentLevel: boolean;
  sorting: SortSetting;
  level: number;
  markedItems: number[];
};

export interface SessionContextType extends PersistedSettings {
  user: WanikaniUserData | null;
  isLoggedIn: boolean;
  maxLevel: number;
  loading: boolean;
  setMarkedItems: (markedItems: number[] | ((prev: number[]) => number[])) => void;
  updateSettings: (
    key: keyof PersistedSettings,
    value: PersistedSettings[keyof PersistedSettings]
  ) => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);
