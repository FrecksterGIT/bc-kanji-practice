import { FC, ReactNode, use, useCallback, useEffect, useMemo, useState } from "react";
import {
  PersistedSettings,
  SessionContext,
  SessionContextType,
  SortSetting,
} from "./SessionContext.tsx";
import { saveSettings } from "../utils/itemDB.ts";
import { getInitialSettings, getUser } from "../utils/session.ts";

interface UserProviderProps {
  children: ReactNode;
}

const DEFAULT_SETTINGS: PersistedSettings = {
  apiKey: "",
  limitToLearned: false,
  limitToCurrentLevel: false,
  sorting: SortSetting.id,
  level: 1,
  markedItems: [],
};

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  const storedSettings = use(getInitialSettings());
  const [persistedSettings, setPersistedSettings] = useState<PersistedSettings>(
    () => storedSettings ?? DEFAULT_SETTINGS,
  );
  const user = use(getUser(persistedSettings.apiKey));
  const isLoggedIn = !!user;
  const maxLevel = user?.level ?? 3;

  useEffect(() => {
    saveSettings(persistedSettings).then();
  }, [persistedSettings]);

  const updateSettings = useCallback(
    (key: keyof PersistedSettings, value: PersistedSettings[keyof PersistedSettings]) => {
      setPersistedSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const setMarkedItems = useCallback(
    (newMarkedItems: number[] | ((prev: number[]) => number[])) =>
      setPersistedSettings((prev) => ({
        ...prev,
        markedItems:
          typeof newMarkedItems === "function" ? newMarkedItems(prev.markedItems) : newMarkedItems,
      })),
    [],
  );

  const value: SessionContextType = useMemo(
    () => ({
      user,
      isLoggedIn,
      maxLevel,
      updateSettings,
      setMarkedItems,
      ...persistedSettings,
    }),
    [isLoggedIn, maxLevel, persistedSettings, setMarkedItems, updateSettings, user],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
};
