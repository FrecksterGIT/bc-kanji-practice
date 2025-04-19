import React, {createContext, useContext, ReactNode, useMemo} from 'react';
import {useWanikaniUser} from '../hooks/useWanikaniUser';

// Import the user data type from the hook file
import type {WanikaniUserData} from '../hooks/useWanikaniUser';

// Define the shape of the context
interface UserContextType {
    user: WanikaniUserData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
    const {user, loading, error, refetch} = useWanikaniUser();

    const value = useMemo(() => ({
        user,
        loading,
        error,
        refetch
    }), [user, loading, error, refetch]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the context
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
