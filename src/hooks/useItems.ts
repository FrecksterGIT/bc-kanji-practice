import { useCallback, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore.ts';
import { useLocation } from 'react-router-dom';

import { WanikaniSubject } from '../types';
import useMarkedItems from './useMarkedItems.ts';
import { assignmentDB, subjectDB } from '../utils/db';

export const useItems = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Array<WanikaniSubject>>([]);
  const limitToLearned = useSettingsStore((state) => state.limitToLearned);
  const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
  const level = useSettingsStore((state) => state.level);
  const { markedItems } = useMarkedItems();
  const [plannedAssignments, setPlannedAssignments] = useState(new Map<number, Date>());
  const [startedAssignments, setStartedAssignments] = useState<number[]>([]);
  const { pathname } = useLocation();

  useEffect(() => {
    if (limitToLearned || sortByNextReview) {
      assignmentDB.getAll().then((assignments) => {
        if (assignments) {
          const availableDatesMap = new Map<number, Date>();
          const started: number[] = [];
          assignments.forEach((assignment) => {
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
    (items: WanikaniSubject[]) =>
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

  const loadMarkedItems = useCallback(() => {
    setLoading(true);
    subjectDB.getByIds(markedItems).then((items) => {
      setData(items);
      setLoading(false);
    });
  }, [markedItems]);

  const loadKanji = useCallback(() => {
    setLoading(true);
    subjectDB.getByObjectAndLevel('kanji', level).then((items) => {
      if (items) {
        setData(filterAndSort(items));
      }
      setLoading(false);
    });
  }, [filterAndSort, level]);

  const loadVocabulary = useCallback(() => {
    setLoading(true);
    Promise.all([
      subjectDB.getByObjectAndLevel('vocabulary', level),
      subjectDB.getByObjectAndLevel('kana_vocabulary', level),
    ]).then((all) => {
      if (all[0] && all[1]) {
        const items = [...all[0], ...all[1]];
        setData(filterAndSort(items));
      }
      setLoading(false);
    });
  }, [filterAndSort, level]);

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
