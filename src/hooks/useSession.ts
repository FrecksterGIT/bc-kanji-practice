import { use } from 'react';
import { SessionContext, SessionContextType } from '../contexts/SessionContext.tsx';

export const useSession = (): SessionContextType => {
  const context = use(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
