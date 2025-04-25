import { createContext } from 'react';
import { KanjiItem, ValidationContextType } from '../types';

export const ValidationContext = createContext<ValidationContextType>({
  items: [],
  item: undefined as unknown as KanjiItem,
  selectedIndex: 0,
  setSelectedIndex: () => {},
  isValid: false,
  validate: () => false,
  validItems: [],
});
