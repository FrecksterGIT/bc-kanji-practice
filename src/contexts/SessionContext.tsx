import { createContext } from "react";
import { WanikaniUserData } from "../wanikani";

export enum SortSetting {
  id = "id",
  nextReview = "nextReview",
  randomize = "randomize",
}

export type PersistedSettings = {
  apiKey: string;
  limitToLearned: boolean;
  limitToCurrentLevel: boolean;
  sorting: SortSetting;
  level: number;
  markedItems: number[];
};

export type ConnectionStatus = "no-key" | "ok" | "invalid-key" | "unreachable";

export interface SessionContextType extends PersistedSettings {
  user: WanikaniUserData | null;
  isLoggedIn: boolean;
  /** Distinguishes a bad key ("invalid-key") from a failed request ("unreachable"). */
  connectionStatus: ConnectionStatus;
  retryConnection: () => void;
  maxLevel: number;
  setMarkedItems: (markedItems: number[] | ((prev: number[]) => number[])) => void;
  updateSettings: (
    key: keyof PersistedSettings,
    value: PersistedSettings[keyof PersistedSettings],
  ) => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);
