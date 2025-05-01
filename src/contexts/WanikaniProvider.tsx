import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { get, set, update } from 'idb-keyval';
import {
  baseUrl,
  BasicDataType,
  resources,
  ResourceType,
  WanikaniContext,
} from './WanikaniContext.ts';
import { useSettingsStore } from '../store/settingsStore.ts';

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const apiKey = useSettingsStore((store) => store.apiKey);
  const loadingPromises = useMemo(() => new Map<string, Promise<Response>>(), []);

  const writeData = useCallback(async function writeData<T extends BasicDataType = BasicDataType>(
    data: T[]
  ): Promise<void> {
    const blocks = data.reduce(
      (acc, item) => {
        if (!acc[item.object]) {
          acc[item.object] = [];
        }
        acc[item.object].push(item);
        return acc;
      },
      {} as Record<string, T[]>
    );
    return Promise.all(
      Object.entries(blocks).map(([key, value]) =>
        update<T[]>(key, (existing) => {
          if (!existing) {
            return value;
          }
          return [
            ...existing.filter(
              (existingEntry) => !value.find((newValue) => newValue.id === existingEntry.id)
            ),
            ...value,
          ];
        })
      )
    ).then();
  }, []);

  const catcher = useCallback(function catcher<T extends BasicDataType = BasicDataType>(
    url: string,
    skipCache = false
  ): Promise<{ data: T[]; next_url?: string } | undefined> {
    return new Promise((resolve) => {
      if (skipCache) {
        resolve(undefined);
        return;
      }
      get(url).then((value) => {
        if (value) {
          resolve(value as { data: T[]; next_url?: string });
        } else {
          resolve(undefined);
        }
      });
    });
  }, []);

  const fetcher = useCallback(
    function fetcher<T extends BasicDataType = BasicDataType>(
      url: string,
      skipCache = false
    ): Promise<{ data: T[]; next_url?: string }> {
      if (!apiKey) {
        return Promise.resolve({ data: [], next_url: undefined });
      }
      return new Promise((resolve) => {
        catcher<T>(url, skipCache).then((cachedData) => {
          if (cachedData) {
            resolve(cachedData);
            return;
          }
          const response = loadingPromises.has(url)
            ? loadingPromises.get(url)!
            : fetch(url.toString(), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Wanikani-Revision': '20170710',
                  Authorization: `Bearer ${apiKey}`,
                },
              });
          loadingPromises.set(url, response);
          response.then((result) => {
            if (result.ok) {
              result
                .clone()
                .json()
                .then((data) => {
                  writeData<T>(data.data).then(() => {
                    set(url, { data: data.data, next_url: data.pages?.next_url }).then(() => {
                      resolve({ data: data.data, next_url: data.pages?.next_url });
                    });
                  });
                });
            } else {
              resolve({ data: [], next_url: undefined });
            }
          });
        });
      });
    },
    [apiKey, catcher, loadingPromises, writeData]
  );

  const load = useCallback(
    async function load<T extends BasicDataType = BasicDataType>(type: ResourceType) {
      const url = new URL(resources[type], baseUrl);
      const result = await fetcher<T>(url.toString());
      const allData = [...result.data];
      if (result.next_url) {
        let next = result.next_url;
        while (next) {
          const nextData = await fetcher<T>(next);
          allData.push(...nextData.data);
          next = nextData.next_url!;
        }
      }
      if (allData.length > 0) {
        const latest = allData.reduce((acc, item) => {
          const date = new Date(item.data_updated_at);
          if (!acc) return item.data_updated_at;
          if (date > new Date(acc)) {
            return item.data_updated_at;
          }
          return acc;
        }, '');

        if (latest) {
          url.searchParams.set('updated_after', latest);
          await fetcher<T>(url.toString(), true).then((data) => {
            allData.push(...data.data);
          });
        }
      }

      return allData;
    },
    [fetcher]
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([load(ResourceType.subjects), load(ResourceType.assignments)]).then(() => {
      setLoading(false);
    });
  }, [load]);

  return <WanikaniContext value={{ loading }}>{children}</WanikaniContext>;
};
