import { createCache } from 'async-cache-dedupe';
import {
  WanikaniAssignment,
  WanikaniCollection,
  WanikaniSubject,
  WanikaniUserData,
} from '../../types';

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

const cache = createCache({
  storage: { type: 'memory' },
})
  .define('fetchAssignments', fetchFn<WanikaniCollection<WanikaniAssignment>>)
  .define('fetchSubjects', fetchFn<WanikaniCollection<WanikaniSubject>>)
  .define('fetchUser', fetchFn<{ data: WanikaniUserData }>);

export default cache;
