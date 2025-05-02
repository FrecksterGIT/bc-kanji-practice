import { createContext, Dispatch, SetStateAction } from 'react';
import { WanikaniSubject } from '../wanikani';

export interface ItemContextType {
  items: Array<WanikaniSubject>;
  item: WanikaniSubject;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  validate: (input: string) => boolean;
  validItems: number[];
  isValid: boolean;
  moveToNext: () => void;
}

export const ItemContext = createContext<ItemContextType>({
  items: [],
  item: undefined as unknown as WanikaniSubject,
  selectedIndex: 0,
  setSelectedIndex: () => {},
  isValid: false,
  validate: () => false,
  validItems: [],
  moveToNext: () => {},
});
