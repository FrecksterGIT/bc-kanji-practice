import { createContext, Dispatch, SetStateAction } from 'react';
import { WanikaniSubject } from '../wanikani';

export type Section = 'kanji' | 'vocabulary' | 'marked';

export interface ItemContextType {
  items: Array<WanikaniSubject>;
  item: WanikaniSubject;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  validate: (input: string) => boolean;
  validItems: number[];
  isValid: boolean;
  moveToNext: () => void;
  section: Section;
  setSection: Dispatch<SetStateAction<Section>>;
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
  section: 'kanji',
  setSection: () => {},
});
