import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { WanikaniUserResponse, WanikaniUserData } from '../types';
import { SessionContext, SessionContextType } from './SessionContext.tsx';
import { useSettingsStore } from '../store/settingsStore.ts';

interface UserProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const [user, setUser] = useState<WanikaniUserData | null>(null);

  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
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
      fetch('https://api.wanikani.com/v2/user', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.json() as Promise<WanikaniUserResponse>;
        })
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

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const getVoice = () => {
        setVoice(speechSynthesis.getVoices().find((voice) => voice.lang === 'ja-JP') ?? null);
      };
      speechSynthesis.addEventListener('voiceschanged', getVoice);
      getVoice();

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', getVoice);
      };
    }
  }, []);

  const speak = useCallback(
    (text?: string) => {
      if ('speechSynthesis' in window && text) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = 'ja-JP';

        speechSynthesis.speak(utterance);
      }
    },
    [voice]
  );

  const value: SessionContextType = useMemo(
    () => ({
      user,
      isLoggedIn,
      maxLevel,
      loading,
      speak,
    }),
    [user, isLoggedIn, maxLevel, loading, speak]
  );

  return <SessionContext value={value}>{!loading && children}</SessionContext>;
};
