import { get } from 'idb-keyval';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore.ts';

type UseItemsProps =
  | {
      ids: number[];
    }
  | {
      type: 'kanji' | 'vocabulary';
      level: number;
    };

export const useItems = (params: UseItemsProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Array<unknown>>([]);
  const limitToLearned = useSettingsStore((state) => state.limitToLearned);
  const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
  const [, setAssignments] = useState<unknown[]>([]);

  useEffect(() => {
    if (limitToLearned || sortByNextReview) {
      get('assignments').then((data) => {
        if (data) {
          setAssignments(data);
        }
      });
    }
  }, [limitToLearned, sortByNextReview]);

  useEffect(() => {
    if (!('ids' in params)) {
      return;
    }
    setLoading(true);
    Promise.all([get('kanji'), get('vocabulary'), get('kana_vocabulary')]).then((all) => {
      setData(
        params.ids.map((id) => [...all[0], ...all[1], ...all[2]].find((item) => item.id === id)!)
      );
      setLoading(false);
    });
  }, [params]);

  useEffect(() => {
    if (!('type' in params) || params.type !== 'kanji') {
      return;
    }
    setLoading(true);
    get('kanji').then((all) => {
      setData(all.filter((item) => item.data.level === params.level));
      setLoading(false);
    });
  }, [params]);

  useEffect(() => {
    if (!('type' in params) || params.type !== 'vocabulary') {
      return;
    }
    setLoading(true);
    Promise.all([get('vocabulary'), get('kana_vocabulary')]).then((all) => {
      setData([...all[0], ...all[1]].filter((item) => item.data.level === params.level));
      setLoading(false);
    });
  }, [params]);

  return { loading, data };
};
