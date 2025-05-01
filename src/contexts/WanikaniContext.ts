import { createContext } from 'react';

export type BasicDataType = {
  data: unknown;
  data_updated_at: string;
  id: number;
  object: string;
  url: string;
};

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
