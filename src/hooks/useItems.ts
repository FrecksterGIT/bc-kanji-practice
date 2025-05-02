import { useContext } from 'react';
import { ItemContext, ItemContextType } from '../contexts/ItemContext.tsx';

const useItems = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a SessionProvider');
  }
  return context;
};

export default useItems;
