import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKey: string;
  limitToLearned: boolean;
  limitToCurrentLevel: boolean;
  sortByNextReview: boolean;
  level: number;
  setApiKey: (apiKey: string) => void;
  setLimitToLearned: (limit: boolean) => void;
  setLimitToCurrentLevel: (limit: boolean) => void;
  setSortByNextReview: (sort: boolean) => void;
  setLevel: (level: number) => void;
}

export const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      apiKey: '',
      limitToLearned: false,
      limitToCurrentLevel: false,
      sortByNextReview: false,
      level: 1,

      setApiKey: (apiKey) => set({ apiKey }),
      setLimitToLearned: (limitToLearned) => set({ limitToLearned }),
      setLimitToCurrentLevel: (limitToCurrentLevel) => set({ limitToCurrentLevel }),
      setSortByNextReview: (sortByNextReview) => set({ sortByNextReview }),
      setLevel: (level) => set({ level }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
