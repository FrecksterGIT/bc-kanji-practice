import { PersistedSettings, SortSetting } from "../contexts/SessionContext.tsx";
import { WanikaniUserData } from "../wanikani";

export const DEFAULT_SETTINGS: PersistedSettings = {
  apiKey: "",
  limitToLearned: false,
  limitToCurrentLevel: false,
  sorting: SortSetting.id,
  level: 1,
  markedItems: [],
};

const LOGGED_OUT_MAX_LEVEL = 3;

/** Merges stored settings over the defaults so fields added later exist for old saves. */
export const mergeSettings = (stored?: Partial<PersistedSettings>): PersistedSettings => ({
  ...DEFAULT_SETTINGS,
  ...stored,
});

/** Free accounts only have data up to subscription.max_level_granted. */
export const maxLevelFor = (user: WanikaniUserData | null): number =>
  user?.subscription?.max_level_granted ?? LOGGED_OUT_MAX_LEVEL;

export const clampLevel = (level: number, maxLevel: number): number =>
  Math.min(Math.max(level, 1), maxLevel);
