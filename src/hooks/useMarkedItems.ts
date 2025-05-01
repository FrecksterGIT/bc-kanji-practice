import { Dispatch, SetStateAction, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

type UseMarkedItemsReturnType = {
  markedItems: number[];
  setMarkedItems: Dispatch<SetStateAction<number[]>>;
  randomizeMarkedItems: () => void;
};

const useMarkedItems = (): UseMarkedItemsReturnType => {
  const [markedItems, setMarkedItems] = useLocalStorage<number[]>('markedItems', []);

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
