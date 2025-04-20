import {createContext} from 'react';
import {UserContextType} from '../types';

// Create the context with a default value
export const SessionContext = createContext<UserContextType | undefined>(undefined);

