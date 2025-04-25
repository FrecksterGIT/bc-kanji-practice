import { createContext } from 'react';
import { UserContextType } from '../types';

export const SessionContext = createContext<UserContextType | undefined>(undefined);
