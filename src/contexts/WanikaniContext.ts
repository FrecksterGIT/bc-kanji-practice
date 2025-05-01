import { createContext } from 'react';
import { WanikaniAssignment, WanikaniSubject } from '../types';

export type BasicDataType = WanikaniSubject | WanikaniAssignment;

export enum ResourceType {
  'subjects' = 'subjects',
  'assignments' = 'assignments',
}

export const baseUrl = 'https://api.wanikani.com/';

export const resources: Record<ResourceType, string> = {
  [ResourceType.subjects]: '/v2/subjects?types=kanji,vocabulary,kana_vocabulary',
  [ResourceType.assignments]: '/v2/assignments?started=true&burned=false',
};

export type WanikaniContextType = {
  loading: boolean;
};

export const WanikaniContext = createContext<WanikaniContextType>({
  loading: false,
});
