import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import useWanikaniUser from '../hooks/useWanikaniUser.ts';
import { useSettingsStore } from '../store/settingsStore.ts';
import { loadDataFile } from '../utils/dataLoader.ts';
import { SessionContext } from './SessionContext.tsx';
import { UserContextType } from '../types';

interface UserProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  const { user, loading: userLoading, error, refetch } = useWanikaniUser();
  const apiKey = useSettingsStore((state) => state.apiKey);

  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [maxLevel, setMaxLevel] = useState<number>(3);
  const [prefetching, setPrefetching] = useState<boolean>(false);

  const loading = useMemo(() => userLoading || prefetching, [userLoading, prefetching]);

  useEffect(() => {
    setPrefetching(true);

    const prefetchPromises = [];
    for (let i = 1; i <= maxLevel; i++) {
      // Use the unified loadDataFile function from utils
      prefetchPromises.push(
        loadDataFile('kanji', i).catch((err) =>
          console.error(`Error preloading kanji data for level ${i}:`, err)
        )
      );
    }

    Promise.all(prefetchPromises).finally(() => {
      setPrefetching(false);
    });
  }, [user, apiKey, maxLevel]);

  useEffect(() => {
    setPrefetching(true);

    const maxVocabularyLevel = 60;

    const prefetchVocabularyPromises = [];
    for (let i = 1; i <= maxVocabularyLevel; i++) {
      // Use the unified loadDataFile function from utils
      prefetchVocabularyPromises.push(
        loadDataFile('vocabulary', i).catch((err) =>
          console.error(`Error preloading vocabulary data for level ${i}:`, err)
        )
      );
    }

    Promise.all(prefetchVocabularyPromises).finally(() => {
      setPrefetching(false);
    });
  }, []);

  useEffect(() => {
    if (user?.id) {
      setIsLoggedIn(true);
      setMaxLevel(user.level);
    } else {
      setIsLoggedIn(false);
      setMaxLevel(3);
    }
  }, [user, loading]);

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

  const value: UserContextType = useMemo(
    () => ({
      user,
      isLoggedIn,
      maxLevel,
      loading,
      error,
      refetch,
      speak,
    }),
    [user, isLoggedIn, maxLevel, loading, error, refetch, speak]
  );

  return <SessionContext value={value}>{children}</SessionContext>;
};
