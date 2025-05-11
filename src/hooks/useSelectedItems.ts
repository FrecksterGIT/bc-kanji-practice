import { useCallback, useEffect, useState } from 'react';

import { Section } from '../contexts/ItemContext.tsx';
import { WanikaniSubject } from '../wanikani';
import { SortSetting } from '../contexts/SessionContext.tsx';
import {
  getAllAssignments,
  getSubjectByIds,
  getSubjectsByObjectAndLevel,
} from '../utils/itemDB.ts';
import useSession from './useSession.ts';
import { useLocation } from 'react-router-dom';

export const useSelectedItems = (section: Section) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Array<WanikaniSubject>>([]);
  const { limitToLearned, sorting, level, markedItems } = useSession();
  const { state } = useLocation();
  const [plannedAssignments, setPlannedAssignments] = useState(new Map<number, Date>());
  const [startedAssignments, setStartedAssignments] = useState<number[]>([]);

  useEffect(() => {
    getAllAssignments().then((assignments) => {
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
  }, [limitToLearned, sorting]);

  const filterAndSort = useCallback(
    (items: WanikaniSubject[], filtering = true) =>
      items
        .filter(
          (item) =>
            !filtering ||
            (item.data.level === level && (!limitToLearned || startedAssignments.includes(item.id)))
        )
        .sort((a, b) => {
          if (sorting === SortSetting.nextReview) {
            if (!plannedAssignments.has(a.id) && !plannedAssignments.has(b.id)) return 0;
            if (!plannedAssignments.has(a.id)) return 1;
            if (!plannedAssignments.has(b.id)) return -1;
            return (
              plannedAssignments.get(a.id)!.getTime() - plannedAssignments.get(b.id)!.getTime()
            );
          }
          if (sorting === SortSetting.randomize) {
            return Math.random() - 0.5;
          }
          return a.id - b.id;
        }),
    [level, limitToLearned, startedAssignments, sorting, plannedAssignments]
  );

  const loadMarkedItems = useCallback(() => {
    setLoading(true);
    getSubjectByIds(markedItems).then((items) => {
      setData(filterAndSort(items, false));
      setLoading(false);
    });
  }, [filterAndSort, markedItems]);

  const loadKanji = useCallback(() => {
    setLoading(true);
    getSubjectsByObjectAndLevel('kanji', level).then((items) => {
      if (items) {
        setData(filterAndSort(items));
      }
      setLoading(false);
    });
  }, [filterAndSort, level]);

  const loadVocabulary = useCallback(() => {
    setLoading(true);
    Promise.all([
      getSubjectsByObjectAndLevel('vocabulary', level),
      getSubjectsByObjectAndLevel('kana_vocabulary', level),
    ]).then((all) => {
      if (all[0] && all[1]) {
        const items = [...all[0], ...all[1]];
        setData(filterAndSort(items));
      }
      setLoading(false);
    });
  }, [filterAndSort, level]);

  useEffect(() => {
    if (section === 'marked') {
      loadMarkedItems();
    }
  }, [loadMarkedItems, section, state]);

  useEffect(() => {
    if (section === 'kanji') {
      loadKanji();
    }
  }, [loadKanji, section, state]);

  useEffect(() => {
    if (section === 'vocabulary') {
      loadVocabulary();
    }
  }, [loadVocabulary, section, state]);

  return { loading, data };
};
