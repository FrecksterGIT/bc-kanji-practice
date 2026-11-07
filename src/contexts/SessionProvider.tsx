import { FC, ReactNode, use, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { PersistedSettings, SessionContext, SessionContextType } from "./SessionContext.tsx";
import { saveSettings } from "../utils/itemDB.ts";
import { getInitialSettings, getUser, retryUser } from "../utils/session.ts";
import { clampLevel, maxLevelFor, mergeSettings } from "../utils/settings.ts";

interface UserProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  const storedSettings = use(getInitialSettings());
  const [persistedSettings, setPersistedSettings] = useState<PersistedSettings>(() =>
    mergeSettings(storedSettings),
  );
  const connection = use(getUser(persistedSettings.apiKey));
  const user = connection.status === "ok" ? connection.user : null;
  const isLoggedIn = !!user;
  const connectionStatus = connection.status;
  const [, bumpRetry] = useReducer((count: number) => count + 1, 0);
  const retryConnection = useCallback(() => {
    retryUser(persistedSettings.apiKey);
    bumpRetry();
  }, [persistedSettings.apiKey]);
  const maxLevel = maxLevelFor(user);
  const level = clampLevel(persistedSettings.level, maxLevel);

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
      connectionStatus,
      retryConnection,
      maxLevel,
      updateSettings,
      setMarkedItems,
      ...persistedSettings,
      level,
    }),
    [
      connectionStatus,
      isLoggedIn,
      level,
      maxLevel,
      persistedSettings,
      retryConnection,
      setMarkedItems,
      updateSettings,
      user,
    ],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
};
