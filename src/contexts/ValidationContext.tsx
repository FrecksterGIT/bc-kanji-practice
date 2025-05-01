import { createContext } from 'react';
import { WanikaniSubject } from '../types';

export interface ValidationContextType {
  items: Array<WanikaniSubject>;
  item: WanikaniSubject;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  validate: (input: string) => boolean;
  validItems: number[];
  isValid: boolean;
  moveToNext: () => void;
}

export const ValidationContext = createContext<ValidationContextType>({
  items: [],
  item: undefined as unknown as WanikaniSubject,
  selectedIndex: 0,
  setSelectedIndex: () => {},
  isValid: false,
  validate: () => false,
  validItems: [],
  moveToNext: () => {},
});
