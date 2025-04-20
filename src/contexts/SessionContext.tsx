import React, {createContext, useContext, ReactNode, useMemo, useCallback, useEffect, useState} from 'react';
import {useWanikaniUser} from '../hooks/useWanikaniUser';
import {useSettingsStore} from '../store/settingsStore';
import {loadDataFile} from '../utils/dataLoader';
import {UserContextType} from '../types';

// Create the context with a default value
const SessionContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
    children: ReactNode;
}

export const SessionProvider: React.FC<UserProviderProps> = ({children}) => {
    const {user, loading: userLoading, error, refetch} = useWanikaniUser();
    const apiKey = useSettingsStore((state) => state.apiKey);

    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [prefetching, setPrefetching] = useState<boolean>(false);

    // Combined loading state from user loading and prefetching
    const loading = userLoading || prefetching;

    // Preload kanji data files for all levels up to the user's max level
    useEffect(() => {
        // Determine max level - use user's level if available and API key is valid, otherwise default to 3
        const maxLevel = (user?.level && apiKey) ? user.level : 3;

        // Set prefetching to true before starting
        setPrefetching(true);

        // Create an array of promises for all levels
        const prefetchPromises = [];
        for (let i = 1; i <= maxLevel; i++) {
            // Use the unified loadDataFile function from utils
            prefetchPromises.push(
                loadDataFile('kanji', i)
                    .catch(err => console.error(`Error preloading kanji data for level ${i}:`, err))
            );
        }

        // Wait for all prefetch operations to complete
        Promise.all(prefetchPromises)
            .finally(() => {
                // Set prefetching to false when done
                setPrefetching(false);
            });
    }, [user, apiKey]);

    // Preload vocabulary data files for all levels, ignoring user level
    useEffect(() => {
        // Set prefetching to true before starting
        setPrefetching(true);

        // Use a fixed maximum level for vocabulary (WaniKani typically has 60 levels)
        const maxVocabularyLevel = 60;

        // Create an array of promises for all vocabulary levels
        const prefetchVocabularyPromises = [];
        for (let i = 1; i <= maxVocabularyLevel; i++) {
            // Use the unified loadDataFile function from utils
            prefetchVocabularyPromises.push(
                loadDataFile('vocabulary', i)
                    .catch(err => console.error(`Error preloading vocabulary data for level ${i}:`, err))
            );
        }

        // Wait for all prefetch operations to complete
        Promise.all(prefetchVocabularyPromises)
            .finally(() => {
                // Set prefetching to false when done
                setPrefetching(false);
            });
    }, []);

    useEffect(() => {
        if ("speechSynthesis" in window) {
            const getVoice = () => {
                setVoice(
                    speechSynthesis.getVoices().find((voice) => voice.lang === "ja-JP") ??
                    null,
                );
            };
            speechSynthesis.addEventListener("voiceschanged", getVoice);
            getVoice();

            return () => {
                speechSynthesis.removeEventListener("voiceschanged", getVoice);
            };
        }
    }, []);

    const speak = useCallback(
        (text?: string) => {
            if ("speechSynthesis" in window && text) {
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = voice;
                utterance.lang = "ja-JP";

                speechSynthesis.speak(utterance);
            }
        },
        [voice],
    );

    const value = useMemo(() => ({
        user,
        loading,
        error,
        refetch,
        speak,
    }), [user, loading, error, refetch, speak]);

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

// Custom hook to use the context
export const useSession = (): UserContextType => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a SessionProvider');
    }
    return context;
};
