import {useDataFiles} from '../hooks/useDataFiles';
import {useSettingsStore} from '../store/settingsStore';
import {useWanikaniAssignments} from '../hooks/useWanikaniAssignments';
import {useMemo, useState, useEffect, useCallback, type FC} from 'react';
import VocabularyList from './VocabularyList';
import ActiveVocabularyBlock from './ActiveVocabularyBlock';
import {createDateSortFunction} from '../utils/sortUtils';

// Define the VocabularyItem interface
interface VocabularyItem {
    id: number;
    level: number;
    word: string;
    reading: {
        reading: string;
        primary: boolean;
    }[];
    meanings: {
        meaning: string;
        primary: boolean;
    }[];
}

interface VocabularyProps {}

const Vocabulary: FC<VocabularyProps> = () => {
    const limitToLearned = useSettingsStore((state) => state.limitToLearned);
    const sortByNextReview = useSettingsStore((state) => state.sortByNextReview);
    const {data, loading: loadingVocabulary, error: vocabularyError} = useDataFiles<VocabularyItem>('vocabulary');
    const {assignments, loading: loadingAssignments, error: assignmentsError} = useWanikaniAssignments('vocabulary');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [userInput, setUserInput] = useState<string>('');
    const [isInputValid, setIsInputValid] = useState<boolean | null>(null);
    const [correctlyEnteredIds, setCorrectlyEnteredIds] = useState<number[]>([]);

    // Filter vocabulary data to only show items that have been started if limitToLearned is true
    // And sort by next review date if sortByNextReview is true
    const filteredData = useMemo(() => {
        if (!data) return null;
        if (!assignments) return data;

        // Create a map of subject_id to available_at date for sorting
        const availableDatesMap = new Map();
        assignments
            .filter(assignment => assignment.data.subject_type === 'vocabulary' || assignment.data.subject_type === 'kana_vocabulary')
            .forEach(assignment => {
                availableDatesMap.set(assignment.data.subject_id, assignment.data.available_at);
            });

        // Filter the data based on limitToLearned
        let result = data;
        if (limitToLearned) {
            // Get the subject_ids of vocabulary assignments that have been started
            const startedVocabularyIds = assignments
                .filter(assignment => assignment.data.subject_type === 'vocabulary' || assignment.data.subject_type === 'kana_vocabulary')
                .map(assignment => assignment.data.subject_id);

            // Filter the vocabulary data to only include items whose IDs are in the startedVocabularyIds array
            result = data.filter(item => startedVocabularyIds.includes(item.id));
        }

        // Sort by next review date if sortByNextReview is true
        if (sortByNextReview) {
            return [...result].sort(createDateSortFunction(availableDatesMap));
        }

        return result;
    }, [data, assignments, limitToLearned, sortByNextReview]);

    // Reset selected index when data changes
    useEffect(() => {
        if (filteredData && filteredData.length > 0) {
            setSelectedIndex(0);
        }
    }, [filteredData]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!filteredData || filteredData.length === 0) return;

            switch (e.key) {
                case 'ArrowRight':
                    setSelectedIndex(prev => (prev + 1) % filteredData.length);
                    setUserInput(''); // Reset input when navigating to a new vocabulary
                    setIsInputValid(null); // Reset validation status
                    break;
                case 'ArrowLeft':
                    setSelectedIndex(prev => (prev - 1 + filteredData.length) % filteredData.length);
                    setUserInput(''); // Reset input when navigating to a new vocabulary
                    setIsInputValid(null); // Reset validation status
                    break;
                case 'Enter':
                    // If the input is valid, navigate to the next item
                    if (isInputValid) {
                        setSelectedIndex(prev => (prev + 1) % filteredData.length);
                        setUserInput(''); // Reset input when navigating to a new vocabulary
                        setIsInputValid(null); // Reset validation status
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [filteredData, isInputValid]);

    // Handle item click
    const handleItemClick = useCallback((index: number) => {
        setSelectedIndex(index);
        setUserInput(''); // Reset input when selecting a new vocabulary
        setIsInputValid(null); // Reset validation status
    }, []);

    // Get valid readings for the currently selected vocabulary
    const getValidReadings = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        const currentVocabulary = filteredData[selectedIndex];

        // Get all readings from the reading array
        return currentVocabulary.reading.map(reading => reading.reading);
    }, [filteredData, selectedIndex]);

    // Handle input change
    const handleInputChange = (value: string) => {
        setUserInput(value);
    };

    // Handle validation
    const handleValidate = (isValid: boolean) => {
        setIsInputValid(isValid);

        // If input is valid and we have filtered data, add the current item's ID to correctlyEnteredIds
        if (isValid && filteredData && filteredData.length > 0) {
            const currentItemId = filteredData[selectedIndex].id;
            if (!correctlyEnteredIds.includes(currentItemId)) {
                setCorrectlyEnteredIds(prev => [...prev, currentItemId]);
            }
        }
    };

    // Determine if we're loading or have an error
    const loading = loadingVocabulary || loadingAssignments;
    const error = vocabularyError || assignmentsError;

    return (
        <div className="flex flex-col items-center py-8">
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
                {loading && (
                    <p className="text-gray-700">Loading vocabulary data...</p>
                )}

                {error && (
                    <p className="text-red-500">Error loading vocabulary data: {error.message}</p>
                )}

                {!loading && !error && filteredData && (
                    <div>
                        {filteredData.length > 0 && (
                            <ActiveVocabularyBlock
                                vocabulary={filteredData[selectedIndex]}
                                position={`${selectedIndex + 1} / ${filteredData.length}`}
                                userInput={userInput}
                                validReadings={getValidReadings}
                                onInputChange={handleInputChange}
                                onValidate={handleValidate}
                            />
                        )}
                        <VocabularyList
                            filteredData={filteredData}
                            selectedIndex={selectedIndex}
                            correctlyEnteredIds={correctlyEnteredIds}
                            handleItemClick={handleItemClick}
                        />

                    </div>
                )}
            </div>
        </div>
    );
};

export default Vocabulary;
