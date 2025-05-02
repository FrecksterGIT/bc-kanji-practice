import { createContext } from 'react';
import { WanikaniAssignment, WanikaniSubject } from '../wanikani';

export type BasicDataType = WanikaniSubject | WanikaniAssignment;

export enum ResourceType {
  'subjects' = 'subjects',
  'assignments' = 'assignments',
}

export const baseUrl = 'https://api.wanikani.com/';

export const resources: Record<ResourceType, string> = {
  [ResourceType.subjects]: '/v2/subjects?types=kanji,vocabulary,kana_vocabulary',
  [ResourceType.assignments]: '/v2/assignments?started=true',
};

export type WanikaniContextType = {
  loading: boolean;
  loadedCount: number;
};

export const WanikaniContext = createContext<WanikaniContextType>({
  loading: false,
  loadedCount: 0,
});
