import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import {
  baseUrl,
  BasicDataType,
  resources,
  ResourceType,
  WanikaniContext,
} from './WanikaniContext.ts';
import { useSettingsStore } from '../store/settingsStore.ts';
import { subjectDB, assignmentDB, SubjectDB, AssignmentDB } from '../utils/db';
import { isAssignmentList, isSubjectList } from '../utils/type-check.ts';

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const apiKey = useSettingsStore((store) => store.apiKey);
  const loadingPromises = useMemo(() => new Map<string, Promise<Response>>(), []);

  const writeData = useCallback(async function writeData<T extends BasicDataType = BasicDataType>(
    data: T[]
  ): Promise<void> {
    if (!data || data.length === 0) {
      return;
    }
    if (isSubjectList(data)) {
      return subjectDB.addMany(data).then();
    }
    if (isAssignmentList(data)) {
      return assignmentDB.addMany(data).then();
    }
  }, []);

  const fetcher = useCallback(
    function fetcher<T extends BasicDataType = BasicDataType>(
      url: string
    ): Promise<{ data: T[]; next_url?: string }> {
      if (!apiKey) {
        return Promise.resolve({ data: [], next_url: undefined });
      }
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

  const initializeLoading = useCallback((db: SubjectDB | AssignmentDB) => {
    return new Promise<string | null>((resolve) =>
      db.getAll().then((items) => {
        resolve(
          items.reduce<string | null>((acc, item) => {
            const date = new Date(item.data_updated_at);
            if (!acc) return item.data_updated_at;
            if (date > new Date(acc)) {
              return item.data_updated_at;
            }
            return acc;
          }, null)
        );
      })
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([initializeLoading(assignmentDB), initializeLoading(subjectDB)]).then(
      ([latestAssignments, latestSubjects]) => {
        Promise.all([
          load(ResourceType.subjects, latestSubjects),
          load(ResourceType.assignments, latestAssignments),
        ]).then(() => {
          setLoading(false);
        });
      }
    );
  }, [load, initializeLoading]);

  return <WanikaniContext value={{ loading }}>{children}</WanikaniContext>;
};
