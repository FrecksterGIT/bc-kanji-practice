import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum SortSetting {
  'id' = 'id',
  'nextReview' = 'nextReview',
  'randomize' = 'randomize',
}

interface SettingsState {
  apiKey: string;
  limitToLearned: boolean;
  limitToCurrentLevel: boolean;
  sorting: SortSetting;
  level: number;
  setApiKey: (apiKey: string) => void;
  setLimitToLearned: (limit: boolean) => void;
  setLimitToCurrentLevel: (limit: boolean) => void;
  setSorting: (sort: SortSetting) => void;
  setLevel: (level: number) => void;
}

export const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      apiKey: '',
      limitToLearned: false,
      limitToCurrentLevel: false,
      sorting: SortSetting.id,
      level: 1,

      setApiKey: (apiKey) => set({ apiKey }),
      setLimitToLearned: (limitToLearned) => set({ limitToLearned }),
      setLimitToCurrentLevel: (limitToCurrentLevel) => set({ limitToCurrentLevel }),
      setSorting: (sorting) => set({ sorting }),
      setLevel: (level) => set({ level }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
