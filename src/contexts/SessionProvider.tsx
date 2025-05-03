import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { WanikaniUserData } from '../wanikani';
import {
  PersistedSettings,
  SessionContext,
  SessionContextType,
  SortSetting,
} from './SessionContext.tsx';
import wkLoad from '../utils/wkLoad.ts';
import * as itemDB from '../utils/itemDB.ts';

interface UserProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  // User state
  const [user, setUser] = useState<WanikaniUserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [maxLevel, setMaxLevel] = useState<number>(3);
  const [persistedSettings, setPersistedSettings] = useState<PersistedSettings>({
    apiKey: '',
    limitToLearned: false,
    limitToCurrentLevel: false,
    sorting: SortSetting.id,
    level: 1,
    markedItems: [],
  });

  useEffect(() => {
    setSettingsLoading(true);
    const loadSettings = async () => {
      const settings = await itemDB.getSettings();
      if (settings) {
        setPersistedSettings(settings);
      }
    };

    loadSettings().then(() => {
      setSettingsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (persistedSettings && !settingsLoading) {
      itemDB.saveSettings(persistedSettings).then();
    }
  }, [persistedSettings, settingsLoading]);

  const updateSettings = useCallback(
    (key: keyof PersistedSettings, value: PersistedSettings[keyof PersistedSettings]) => {
      setPersistedSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const setMarkedItems = useCallback(
    (newMarkedItems: number[] | ((prev: number[]) => number[])) =>
      setPersistedSettings((prev) => ({
        ...prev,
        markedItems:
          typeof newMarkedItems === 'function' ? newMarkedItems(prev.markedItems) : newMarkedItems,
      })),
    []
  );

  // Load user data when apiKey changes
  useEffect(() => {
    if (settingsLoading) {
      return;
    }
    new Promise<void>(() => {
      if (!persistedSettings.apiKey) {
        setUser(null);
        setIsLoggedIn(false);
        setMaxLevel(3);
        setUserLoading(false);
        return;
      }
      setUserLoading(true);
      wkLoad
        .user({ url: 'https://api.wanikani.com/v2/user', apiKey: persistedSettings.apiKey })
        .then(({ data }) => {
          setUser(data);
          setIsLoggedIn(true);
          setMaxLevel(data.level);
          setUserLoading(false);
        })
        .catch(() => {
          setUser(null);
          setIsLoggedIn(false);
          setMaxLevel(3);
          setUserLoading(false);
        });
    }).then();
  }, [persistedSettings.apiKey, settingsLoading]);

  const value: SessionContextType = useMemo(
    () => ({
      user,
      isLoggedIn,
      maxLevel,
      loading: userLoading || settingsLoading,
      updateSettings,
      setMarkedItems,
      ...persistedSettings,
    }),
    [
      isLoggedIn,
      maxLevel,
      persistedSettings,
      setMarkedItems,
      settingsLoading,
      updateSettings,
      user,
      userLoading,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{!userLoading && children}</SessionContext.Provider>
  );
};
