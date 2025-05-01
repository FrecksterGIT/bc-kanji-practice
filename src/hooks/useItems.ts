import { get } from 'idb-keyval';
import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore.ts';
import { useLocation } from 'react-router-dom';

import {
  WanikaniAssignment,
  WanikaniKanaVocabularySubject,
  WanikaniKanjiSubject,
  WanikaniVocabularySubject,
} from '../types';
import useMarkedItems from './useMarkedItems.ts';

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
  const { markedItems } = useMarkedItems();
  const [plannedAssignments, setPlannedAssignments] = useState(new Map<number, Date>());
  const [startedAssignments, setStartedAssignments] = useState<number[]>([]);
  const { pathname } = useLocation();

  useEffect(() => {
    if (limitToLearned || sortByNextReview) {
      get<WanikaniAssignment[]>('assignment').then((data) => {
        if (data) {
          const availableDatesMap = new Map<number, Date>();
          const started: number[] = [];
          data.forEach((assignment) => {
            if (assignment.data.started_at) {
              started.push(assignment.data.subject_id);
            }
            if (assignment.data.available_at) {
              availableDatesMap.set(
                assignment.data.subject_id,
                new Date(assignment.data.available_at)
              );
            }
          });
          setStartedAssignments(started);
          setPlannedAssignments(availableDatesMap);
        }
      });
    }
  }, [limitToLearned, sortByNextReview]);

  const filterAndSort = useCallback(
    (items: SubjectTypes[]) =>
      items
        .filter(
          (item) =>
            item.data.level === level && (!limitToLearned || startedAssignments.includes(item.id))
        )
        .sort((a, b) => {
          if (!sortByNextReview) return 0;
          if (!plannedAssignments.has(a.id) && !plannedAssignments.has(b.id)) return 0;
          if (!plannedAssignments.has(a.id)) return 1;
          if (!plannedAssignments.has(b.id)) return -1;
          return plannedAssignments.get(a.id)!.getTime() - plannedAssignments.get(b.id)!.getTime();
        }),
    [level, limitToLearned, startedAssignments, sortByNextReview, plannedAssignments]
  );

  const filterMarked = useCallback(
    (items: SubjectTypes[]) => {
      return markedItems.map((marked) => items.find((item) => item.id === marked)!);
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
    if (pathname === '/marked') {
      loadMarkedItems();
    }
  }, [loadMarkedItems, pathname]);

  useEffect(() => {
    if (pathname === '/kanji') {
      loadKanji();
    }
  }, [loadKanji, pathname]);

  useEffect(() => {
    if (pathname === '/vocabulary') {
      loadVocabulary();
    }
  }, [loadVocabulary, pathname]);

  return { loading, data };
};
