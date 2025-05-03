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
  markedItems: number[];
  setApiKey: (apiKey: string) => void;
  setLimitToLearned: (limit: boolean) => void;
  setLimitToCurrentLevel: (limit: boolean) => void;
  setSorting: (sort: SortSetting) => void;
  setLevel: (level: number) => void;
  setMarkedItems: (markedItems: number[] | ((prev: number[]) => number[])) => void;
}

export const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      apiKey: '',
      limitToLearned: false,
      limitToCurrentLevel: false,
      sorting: SortSetting.id,
      level: 1,
      markedItems: [],

      setApiKey: (apiKey) => set({ apiKey }),
      setLimitToLearned: (limitToLearned) => set({ limitToLearned }),
      setLimitToCurrentLevel: (limitToCurrentLevel) => set({ limitToCurrentLevel }),
      setSorting: (sorting) => set({ sorting }),
      setLevel: (level) => set({ level }),
      setMarkedItems: (markedItems) =>
        set((state) => ({
          markedItems: typeof markedItems === 'function'
            ? markedItems(state.markedItems)
            : markedItems
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
