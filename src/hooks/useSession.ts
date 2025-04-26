import { UserContextType } from '../types';
import { useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext.tsx';

const useSession = (): UserContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a SessionProvider');
  }
  return context;
};

export default useSession;
