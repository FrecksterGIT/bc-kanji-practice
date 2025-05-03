import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  baseUrl,
  BasicDataType,
  resources,
  ResourceType,
  WanikaniContext,
} from './WanikaniContext.ts';
import { isAssignmentList, isSubjectList } from '../utils/typeChecks.ts';
import {
  addManyAssignments,
  addManySubjects,
  getAllAssignments,
  getAllSubjects,
} from '../utils/itemDB.ts';
import wkLoad from '../utils/wkLoad.ts';
import useSession from '../hooks/useSession.ts';

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const { apiKey, isLoggedIn } = useSession();

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
      url: string,
      type: ResourceType
    ): Promise<{ data: T[]; next_url?: string | null }> {
      if (!apiKey || !isLoggedIn) {
        return Promise.resolve({ data: [], next_url: undefined });
      }
      setLoadedCount((prev) => prev + 1);
      if (type === ResourceType.subjects) {
        const data = await wkLoad.subjects({ url, apiKey });
        if (data.data.length > 0) {
          await writeData(data.data);
        }
        return { data: data.data as T[], next_url: data.pages?.next_url };
      } else if (type === ResourceType.assignments) {
        const data = await wkLoad.assignments({ url, apiKey });
        if (data.data.length > 0) {
          await writeData(data.data);
        }
        return { data: data.data as T[], next_url: data.pages?.next_url };
      }
      return { data: [] };
    },
    [apiKey, isLoggedIn, writeData]
  );

  const load = useCallback(
    async function load<T extends BasicDataType = BasicDataType>(
      type: ResourceType,
      latest: string | null
    ) {
      const url = new URL(resources[type], baseUrl);
      if (latest) {
        url.searchParams.set('updated_after', latest);
        await fetcher<T>(url.toString(), type).then();
      } else {
        const result = await fetcher<T>(url.toString(), type);
        if (result.next_url) {
          let next = result.next_url;
          while (next) {
            const nextData = await fetcher<T>(next, type);
            next = nextData.next_url!;
          }
        }
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
