import React, {createContext, useContext, ReactNode, useMemo, useCallback, useEffect, useState} from 'react';
import {useWanikaniUser} from '../hooks/useWanikaniUser';

// Import the user data type from the hook file
import type {WanikaniUserData} from '../hooks/useWanikaniUser';

// Define the shape of the context
interface UserContextType {
    user: WanikaniUserData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
    speak: (text: string) => void;
}

// Create the context with a default value
const SessionContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
    children: ReactNode;
}

export const SessionProvider: React.FC<UserProviderProps> = ({children}) => {
    const {user, loading, error, refetch} = useWanikaniUser();

    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

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
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
