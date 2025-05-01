import { Dispatch, SetStateAction, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { MarkedItem } from '../types';

type UseMarkedItemsReturnType = {
  markedItems: MarkedItem[];
  setMarkedItems: Dispatch<SetStateAction<MarkedItem[]>>;
  randomizeMarkedItems: () => void;
};

const useMarkedItems = (): UseMarkedItemsReturnType => {
  const [markedItems, setMarkedItems] = useLocalStorage<MarkedItem[]>('markedItems', []);

  const randomizeMarkedItems = useCallback(() => {
    setMarkedItems((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, [setMarkedItems]);

  return {
    markedItems,
    setMarkedItems,
    randomizeMarkedItems,
  };
};

export default useMarkedItems;
