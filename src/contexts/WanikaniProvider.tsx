import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
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
} from '../utils/data/db.ts';
import cache from '../utils/data/fetchUrl.ts';

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const apiKey = useSettingsStore((store) => store.apiKey);

  const writeData = useCallback(async function writeData<T extends BasicDataType = BasicDataType>(
    data: T[]
  ): Promise<void> {
    if (!data || data.length === 0) {
      return;
    }
    if (isSubjectList(data)) {
      return addManySubjects(data);
    }
    if (isAssignmentList(data)) {
      return addManyAssignments(data);
    }
  }, []);

  const fetcher = useCallback(
    async function fetcher<T extends BasicDataType = BasicDataType>(
      url: string
    ): Promise<{ data: T[]; next_url?: string }> {
      if (!apiKey) {
        return Promise.resolve({ data: [], next_url: undefined });
      }
      setLoadedCount((prev) => prev + 1);
      const data= await cache.fetchUrl({ url, apiKey });
      await writeData<T>(data.data);
      return { data: data.data, next_url: data.pages?.next_url };
    },
    [apiKey, writeData]
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
        if (date.getTime() > new Date(acc).getTime()) {
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

  // 808

  useEffect(() => {
    setLoading(true);
    initializeLoading().then(([latestSubjects, latestAssignments]) => {
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
