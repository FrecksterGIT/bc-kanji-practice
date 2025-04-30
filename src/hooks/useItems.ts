import { get } from 'idb-keyval';
import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore.ts';
import { useLocation } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import {
  MarkedItem,
  WanikaniAssignment,
  WanikaniKanaVocabularySubject,
  WanikaniKanjiSubject,
  WanikaniVocabularySubject,
} from '../types';

type SubjectTypes =
  | WanikaniKanaVocabularySubject
  | WanikaniVocabularySubject
  | WanikaniKanjiSubject;

export const useItems = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Array<SubjectTypes>>([]);
  const limitToLearned = useSettingsStore((state) => state.limitToLearned);
  const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
  const level = useSettingsStore((state) => state.level);
  const [markedItems] = useLocalStorage<MarkedItem[]>('markedItems', []);
  const [startedAssignments, setStartedAssignments] = useState(new Map<number, Date>());
  const { pathname } = useLocation();

  useEffect(() => {
    if (limitToLearned || sortByNextReview) {
      get<WanikaniAssignment[]>('assignment').then((data) => {
        if (data) {
          const availableDatesMap = new Map<number, Date>();
          data.forEach((assignment) => {
            if (assignment.data.available_at) {
              availableDatesMap.set(
                assignment.data.subject_id,
                new Date(assignment.data.available_at)
              );
            }
          });
          setStartedAssignments(availableDatesMap);
        }
      });
    }
  }, [limitToLearned, sortByNextReview]);

  const filterAndSort = useCallback(
    (items: SubjectTypes[]) =>
      items
        .filter(
          (item) =>
            item.data.level === level && (!limitToLearned || startedAssignments.has(item.id))
        )
        .sort((a, b) => {
          if (!sortByNextReview) return 0;
          if (!startedAssignments.has(a.id) && !startedAssignments.has(b.id)) return 0;
          if (!startedAssignments.has(a.id)) return 1;
          if (!startedAssignments.has(b.id)) return -1;
          return startedAssignments.get(a.id)!.getTime() - startedAssignments.get(b.id)!.getTime();
        }),
    [level, limitToLearned, sortByNextReview, startedAssignments]
  );

  const filterMarked = useCallback(
    (items: SubjectTypes[]) => {
      return markedItems.map((marked) => items.find((item) => item.id === marked.id)!);
    },
    [markedItems]
  );

  const loadMarkedItems = useCallback(() => {
    setLoading(true);
    Promise.all([
      get<WanikaniKanjiSubject[]>('kanji'),
      get<WanikaniVocabularySubject[]>('vocabulary'),
      get<WanikaniKanaVocabularySubject[]>('kana_vocabulary'),
    ]).then((all) => {
      if (all[0] && all[1] && all[2]) {
        const items = [...all[0], ...all[1], ...all[2]];
        setData(filterMarked(items));
      }
      setLoading(false);
    });
  }, [filterMarked]);

  const loadKanji = useCallback(() => {
    setLoading(true);
    get<WanikaniKanjiSubject[]>('kanji').then((items) => {
      if (items) {
        setData(filterAndSort(items));
      }
      setLoading(false);
    });
  }, [filterAndSort]);

  const loadVocabulary = useCallback(() => {
    setLoading(true);
    Promise.all([
      get<WanikaniVocabularySubject[]>('vocabulary'),
      get<WanikaniKanaVocabularySubject[]>('kana_vocabulary'),
    ]).then((all) => {
      if (all[0] && all[1]) {
        const items = [...all[0], ...all[1]];
        setData(filterAndSort(items));
      }
      setLoading(false);
    });
  }, [filterAndSort]);

  useEffect(() => {
    switch (pathname) {
      case '/marked': {
        loadMarkedItems();
        break;
      }
      case '/kanji': {
        loadKanji();
        break;
      }
      case '/vocabulary': {
        loadVocabulary();
        break;
      }
      default: {
        setData([]);
        setLoading(false);
      }
    }
  }, [loadKanji, loadMarkedItems, loadVocabulary, pathname, startedAssignments]);

  return { loading, data };
};
