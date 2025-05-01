import { createContext } from 'react';
import { ValidationContextType, WanikaniSubject } from '../types';

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
