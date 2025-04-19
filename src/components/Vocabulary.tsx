import { useDataFiles } from '../hooks/useDataFiles';
import { useSettingsStore } from '../store/settingsStore';
import { useWanikaniAssignments } from '../hooks/useWanikaniAssignments';
import { useMemo, useState, useEffect, useCallback } from 'react';
import KanaInput from './KanaInput';
import VocabularyDetails from './VocabularyDetails';

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

function Vocabulary() {
  const level = useSettingsStore((state) => state.level);
  const { data, loading: loadingVocabulary, error: vocabularyError } = useDataFiles<VocabularyItem>('vocabulary');
  const { assignments, loading: loadingAssignments, error: assignmentsError } = useWanikaniAssignments();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isInputValid, setIsInputValid] = useState<boolean | null>(null);

  // Filter vocabulary data to only show items that have been started
  const filteredData = useMemo(() => {
    if (!data || !assignments) return null;

    // Get the subject_ids of vocabulary assignments that have been started
    const startedVocabularyIds = assignments
      .filter(assignment => assignment.data.subject_type === 'vocabulary')
      .map(assignment => assignment.data.subject_id);

    // Filter the vocabulary data to only include items whose IDs are in the startedVocabularyIds array
    return data.filter(item => startedVocabularyIds.includes(item.id));
  }, [data, assignments]);

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
          break;
        case 'ArrowLeft':
          setSelectedIndex(prev => (prev - 1 + filteredData.length) % filteredData.length);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredData]);

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
  };

  // Determine if we're loading or have an error
  const loading = loadingVocabulary || loadingAssignments;
  const error = vocabularyError || assignmentsError;

  return (
    <div className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-4">Vocabulary Practice (Level {level})</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        {loading && (
          <p className="text-gray-700">Loading vocabulary data...</p>
        )}

        {error && (
          <p className="text-red-500">Error loading vocabulary data: {error.message}</p>
        )}

        {!loading && !error && filteredData && (
          <div>
            <p className="text-gray-700 mb-4">
              Showing {filteredData.length} started vocabulary words for level {level}.
            </p>
            <div className="grid gap-2 auto-rows-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}>
              {filteredData.map((item, index) => (
                <div
                  key={item.id}
                  className={`border p-2 text-center cursor-pointer transition-colors ${selectedIndex === index ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'}`}
                  onClick={() => handleItemClick(index)}
                >
                  <span className="text-xl">{item.word}</span>
                </div>
              ))}
            </div>

            {/* Display currently active vocabulary */}
            {filteredData.length > 0 && (
              <div className="mt-8 p-4 border rounded-lg bg-white shadow-md">
                <h2 className="text-xl font-bold mb-2">Currently Active Vocabulary</h2>
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-4">{filteredData[selectedIndex].word}</div>

                  {/* Reading input section */}
                  <div className="w-full max-w-md mb-4">
                    <label htmlFor="vocabulary-reading" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Reading:
                    </label>
                    <KanaInput
                      id="vocabulary-reading"
                      value={userInput}
                      onChange={handleInputChange}
                      placeholder="Type the reading in hiragana..."
                      validValues={getValidReadings}
                      onValidate={handleValidate}
                    />

                    {/* Feedback message */}
                    {userInput && (
                      <p className={`mt-2 text-sm ${isInputValid ? 'text-green-600' : 'text-red-600'}`}>
                        {isInputValid
                          ? 'Correct reading!'
                          : 'Incorrect reading. Try again.'}
                      </p>
                    )}

                    {/* Valid readings hint */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Valid readings:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getValidReadings.map((reading, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                            {reading}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vocabulary Details Table */}
                  <VocabularyDetails vocabulary={filteredData[selectedIndex]} />

                  <p className="text-gray-600">
                    Use arrow keys to navigate or click on a vocabulary word above.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Vocabulary;
