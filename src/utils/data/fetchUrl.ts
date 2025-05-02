import { createCache } from 'async-cache-dedupe';
import {
  WanikaniAssignment,
  WanikaniCollection,
  WanikaniSubject,
  WanikaniUserData,
} from '../../types';

const fetchFn = async <T>(params: unknown): Promise<T> => {
  if (
    typeof params !== 'object' ||
    params === null ||
    !('url' in params) ||
    !('url' in params) ||
    !('apiKey' in params) ||
    typeof params.apiKey !== 'string' ||
    typeof params.url !== 'string'
  ) {
    throw new Error('Missing url or apiKey in parameters');
  }
  const { url, apiKey } = params;
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
