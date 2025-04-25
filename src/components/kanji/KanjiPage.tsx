import { useDataFiles } from '../../hooks/useDataFiles.ts';
import { useSettingsStore } from '../../store/settingsStore.ts';
import { useWanikaniAssignments } from '../../hooks/useWanikaniAssignments.ts';
import { useMemo, type FC } from 'react';
import List from './List.tsx';
import Details from './Details.tsx';
import { createDateSortFunction } from '../../utils/sortUtils.ts';
import { KanjiItem } from '../../types';
import { ValidationProvider } from '../../contexts/ValidationProvider.tsx';

const KanjiPage: FC = () => {
  const limitToLearned = useSettingsStore((state) => state.limitToLearned);
  const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
  const { data, loading: loadingKanji, error: kanjiError } = useDataFiles<KanjiItem>('kanji');
  const {
    assignments,
    loading: loadingAssignments,
    error: assignmentsError,
  } = useWanikaniAssignments('kanji');

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!assignments) return data;

    const availableDatesMap = new Map();
    assignments
      .filter((assignment) => assignment.data.subject_type === 'kanji')
      .forEach((assignment) => {
        availableDatesMap.set(assignment.data.subject_id, assignment.data.available_at);
      });

    let result = data;
    if (limitToLearned) {
      const startedKanjiIds = assignments
        .filter((assignment) => assignment.data.subject_type === 'kanji')
        .map((assignment) => assignment.data.subject_id);

      result = data.filter((item) => startedKanjiIds.includes(item.id));
    }

    if (sortByNextReview) {
      return [...result].sort(createDateSortFunction(availableDatesMap));
    }

    return result;
  }, [assignments, data, limitToLearned, sortByNextReview]);

  const loading = loadingKanji || loadingAssignments;
  const error = kanjiError || assignmentsError;

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading kanji data...</p>}
        {error && <p className="text-red-500">Error loading kanji data: {error.message}</p>}
        {!loading && !error && filteredData && (
          <ValidationProvider items={filteredData}>
            <Details />
            <List />
          </ValidationProvider>
        )}
      </div>
    </div>
  );
};

export default KanjiPage;
