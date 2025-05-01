import { createCache } from 'async-cache-dedupe';

const fetchFn = async (params: unknown) => {
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
  .define(
    'fetchUrl',
    {
      ttl: 60 * 60,
      stale: 60 * 60,
    },
    fetchFn
  )
  .define('fetchUser', fetchFn);

export default cache;
