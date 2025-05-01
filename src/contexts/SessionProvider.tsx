import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import useWanikaniUser from '../hooks/useWanikaniUser.ts';
import { SessionContext } from './SessionContext.tsx';
import { UserContextType } from '../types';

interface UserProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<UserProviderProps> = ({ children }) => {
  const { user, loading, refetch } = useWanikaniUser();

  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [maxLevel, setMaxLevel] = useState<number>(3);

  useEffect(() => {
    if (!loading) {
      if (user?.id) {
        setIsLoggedIn(true);
        setMaxLevel(user.level);
        setIsLoading(false);
      } else {
        setIsLoggedIn(false);
        setMaxLevel(3);
        setIsLoading(false);
      }
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
      loading: isLoading,
      refetch,
      speak,
    }),
    [user, isLoggedIn, maxLevel, isLoading, refetch, speak]
  );

  return <SessionContext value={value}>{!isLoading && children}</SessionContext>;
};
