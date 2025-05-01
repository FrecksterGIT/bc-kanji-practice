import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import {
  baseUrl,
  BasicDataType,
  resources,
  ResourceType,
  WanikaniContext,
} from './WanikaniContext.ts';
import { useSettingsStore } from '../store/settingsStore.ts';
import { isAssignmentList, isSubjectList } from '../utils/type-check.ts';
import {
  addManyAssignments,
  addManySubjects,
  getAllAssignments,
  getAllSubjects,
} from '../utils/db/db.ts';

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const apiKey = useSettingsStore((store) => store.apiKey);
  const loadingPromises = useMemo(() => new Map<string, Promise<Response>>(), []);

  const writeData = useCallback(async function writeData<T extends BasicDataType = BasicDataType>(
    data: T[]
  ): Promise<void> {
    if (!data || data.length === 0) {
      return;
    }
    if (isSubjectList(data)) {
      return addManySubjects(data).then();
    }
    if (isAssignmentList(data)) {
      return addManyAssignments(data).then();
    }
  }, []);

  const fetcher = useCallback(
    function fetcher<T extends BasicDataType = BasicDataType>(
      url: string
    ): Promise<{ data: T[]; next_url?: string }> {
      if (!apiKey) {
        return Promise.resolve({ data: [], next_url: undefined });
      }
      setLoadedCount(prev => prev + 1);
      return new Promise((resolve) => {
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
                  resolve({ data: data.data, next_url: data.pages?.next_url });
                });
              });
          } else {
            resolve({ data: [], next_url: undefined });
          }
        });
      });
    },
    [apiKey, loadingPromises, writeData]
  );

  const load = useCallback(
    async function load<T extends BasicDataType = BasicDataType>(
      type: ResourceType,
      latest: string | null
    ) {
      const url = new URL(resources[type], baseUrl);
      if (!latest) {
        const result = await fetcher<T>(url.toString());

        if (result.next_url) {
          let next = result.next_url;
          while (next) {
            const nextData = await fetcher<T>(next);
            next = nextData.next_url!;
          }
        }
      } else {
        url.searchParams.set('updated_after', latest);
        await fetcher<T>(url.toString()).then();
      }
    },
    [fetcher]
  );

  const getLatest = useCallback(
    (items: BasicDataType[]) =>
      items.reduce<string | null>((acc, item) => {
        const date = new Date(item.data_updated_at);
        if (!acc) return item.data_updated_at;
        if (date > new Date(acc)) {
          return item.data_updated_at;
        }
        return acc;
      }, null),
    []
  );

  const initializeLoading = useCallback(async () => {
    const [subjects, assignments] = await Promise.all([getAllSubjects(), getAllAssignments()]);
    return [getLatest(subjects), getLatest(assignments)];
  }, [getLatest]);

  useEffect(() => {
    setLoading(true);
    initializeLoading().then(([latestAssignments, latestSubjects]) => {
      Promise.all([
        load(ResourceType.subjects, latestSubjects),
        load(ResourceType.assignments, latestAssignments),
      ]).then(() => {
        setLoading(false);
      });
    });
  }, [load, initializeLoading]);

  return <WanikaniContext value={{ loading, loadedCount }}>{children}</WanikaniContext>;
};
