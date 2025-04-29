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

export const resources: Record<ResourceType, { url: string; params?: Record<string, string> }> = {
  [ResourceType.subjects]: {
    url: '/v2/subjects',
    params: {
      types: 'kanji,vocabulary,kana_vocabulary',
    },
  },
  [ResourceType.assignments]: {
    url: '/v2/assignments',
    params: {
      started: 'true',
      burned: 'false',
    },
  },
};

export type WanikaniContextType = {
  loading: boolean;
};

export const WanikaniContext = createContext<WanikaniContextType>({
  loading: false,
});
