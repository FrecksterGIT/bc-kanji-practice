import { Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from 'usehooks-ts';

type UseMarkedItemsReturnType = {
  markedItems: number[];
  setMarkedItems: Dispatch<SetStateAction<number[]>>;
};

const useMarkedItems = (): UseMarkedItemsReturnType => {
  const [markedItems, setMarkedItems] = useLocalStorage<number[]>('markedItems', []);

  return {
    markedItems,
    setMarkedItems,
  };
};

export default useMarkedItems;
