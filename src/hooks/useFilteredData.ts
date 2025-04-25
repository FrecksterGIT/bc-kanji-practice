import { createDateSortFunction } from '../utils/sortUtils.ts';
import { KanjiItem, VocabularyItem } from '../types';
import { useSettingsStore } from '../store/settingsStore.ts';
import { useWanikaniAssignments } from './useWanikaniAssignments.ts';
import { useDataFiles } from './useDataFiles.ts';

type UseFilteredDataResult<T extends KanjiItem | VocabularyItem> = {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
};

export function useFilteredData<T extends KanjiItem | VocabularyItem>(
  type: 'kanji' | 'vocabulary'
): UseFilteredDataResult<T> {
  const limitToLearned = useSettingsStore((state) => state.limitToLearned);
  const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
  const { data, loading: loadingKanji, error: kanjiError } = useDataFiles<T>(type);
  const {
    assignments,
    loading: loadingAssignments,
    error: assignmentsError,
  } = useWanikaniAssignments(type);

  const loading = loadingKanji || loadingAssignments;
  const error = kanjiError || assignmentsError;

  let result = data;

  if (assignments && data && limitToLearned) {
    result = data.filter((item) =>
      assignments.some((assignment) => assignment.data.subject_id === item.id)
    );
  }

  if (assignments && result && sortByNextReview) {
    const availableDatesMap = new Map();
    assignments.forEach((assignment) => {
      availableDatesMap.set(assignment.data.subject_id, assignment.data.available_at);
    });
    result = result.toSorted(createDateSortFunction(availableDatesMap));
  }

  return { data: result, loading, error };
}
