import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { WanikaniUserData } from '../types';
import { SessionContext, SessionContextType } from './SessionContext.tsx';
import { useSettingsStore } from '../store/settingsStore.ts';
import cache from '../utils/data/fetchUrl.ts';

interface UserProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const [user, setUser] = useState<WanikaniUserData | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [maxLevel, setMaxLevel] = useState<number>(3);

  useEffect(() => {
    new Promise<void>(() => {
      if (!apiKey) {
        setUser(null);
        setIsLoggedIn(false);
        setMaxLevel(3);
        setLoading(false);
        return;
      }
      setLoading(true);
      cache
        .fetchUser({ url: 'https://api.wanikani.com/v2/user', apiKey })
        .then((data) => {
          setUser(data.data);
          setIsLoggedIn(true);
          setMaxLevel(data.data.level);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setIsLoggedIn(false);
          setMaxLevel(3);
          setLoading(false);
        });
    }).then();
  }, [apiKey]);

  const value: SessionContextType = useMemo(
    () => ({
      user,
      isLoggedIn,
      maxLevel,
      loading,
    }),
    [user, isLoggedIn, maxLevel, loading]
  );

  return <SessionContext value={value}>{!loading && children}</SessionContext>;
};
