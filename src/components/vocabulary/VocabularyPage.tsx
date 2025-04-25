import { useDataFiles } from '../../hooks/useDataFiles.ts';
import { useSettingsStore } from '../../store/settingsStore.ts';
import { useWanikaniAssignments } from '../../hooks/useWanikaniAssignments.ts';
import { useMemo, type FC } from 'react';
import List from './List.tsx';
import Details from './Details.tsx';
import { createDateSortFunction } from '../../utils/sortUtils.ts';
import { VocabularyItem } from '../../types';
import { ValidationProvider } from '../../contexts/ValidationProvider.tsx';

const VocabularyPage: FC = () => {
  const limitToLearned = useSettingsStore((state) => state.limitToLearned);
  const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
  const {
    data,
    loading: loadingVocabulary,
    error: vocabularyError,
  } = useDataFiles<VocabularyItem>('vocabulary');
  const {
    assignments,
    loading: loadingAssignments,
    error: assignmentsError,
  } = useWanikaniAssignments('vocabulary');

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!assignments) return data;

    // Create a map of subject_id to available_at date for sorting
    const availableDatesMap = new Map();
    assignments
      .filter(
        (assignment) =>
          assignment.data.subject_type === 'vocabulary' ||
          assignment.data.subject_type === 'kana_vocabulary'
      )
      .forEach((assignment) => {
        availableDatesMap.set(assignment.data.subject_id, assignment.data.available_at);
      });

    // Filter the data based on limitToLearned
    let result = data;
    if (limitToLearned) {
      // Get the subject_ids of vocabulary assignments that have been started
      const startedVocabularyIds = assignments
        .filter(
          (assignment) =>
            assignment.data.subject_type === 'vocabulary' ||
            assignment.data.subject_type === 'kana_vocabulary'
        )
        .map((assignment) => assignment.data.subject_id);

      // Filter the vocabulary data to only include items whose IDs are in the startedVocabularyIds array
      result = data.filter((item) => startedVocabularyIds.includes(item.id));
    }

    // Sort by next review date if sortByNextReview is true
    if (sortByNextReview) {
      return [...result].sort(createDateSortFunction(availableDatesMap));
    }

    return result;
  }, [data, assignments, limitToLearned, sortByNextReview]);

  const loading = loadingVocabulary || loadingAssignments;
  const error = vocabularyError || assignmentsError;

  return (
    <div className="flex flex-col items-center py-12">
      <div className="w-full">
        {loading && <p>Loading vocabulary data...</p>}
        {error && <p className="text-red-500">Error loading vocabulary data: {error.message}</p>}
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

export default VocabularyPage;
