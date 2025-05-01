import { createContext } from 'react';
import { WanikaniUserData } from '../types';

export interface SessionContextType {
  user: WanikaniUserData | null;
  isLoggedIn: boolean;
  maxLevel: number;
  loading: boolean;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);
