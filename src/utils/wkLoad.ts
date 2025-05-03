import { createCache } from 'async-cache-dedupe';
import {
  WanikaniAssignment,
  WanikaniCollection,
  WanikaniResourceResponse,
  WanikaniSubject,
  WanikaniUserData,
} from '../wanikani';

const fetchFn = async <T>({ url, apiKey }: { url: string; apiKey: string }): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Wanikani-Revision': '20170710',
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  return response.json();
};

const wkLoad = createCache({
  storage: { type: 'memory' },
})
  .define('assignments', fetchFn<WanikaniCollection<WanikaniAssignment>>)
  .define('subjects', fetchFn<WanikaniCollection<WanikaniSubject>>)
  .define('user', fetchFn<WanikaniResourceResponse<WanikaniUserData>>);

export default wkLoad;
