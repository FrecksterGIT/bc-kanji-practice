import { use } from 'react';
import { WanikaniContext, WanikaniContextType } from '../contexts/WanikaniContext.ts';

export const useWanikani = (): WanikaniContextType => {
  const context = use(WanikaniContext);
  if (context === undefined) {
    throw new Error('useWanikani must be used within a SessionProvider');
  }
  return context;
};
