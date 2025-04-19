import { useDataFiles } from '../hooks/useDataFiles';
import { useSettingsStore } from '../store/settingsStore';
import { useWanikaniAssignments } from '../hooks/useWanikaniAssignments';
import { useMemo, useState, useEffect, useCallback } from 'react';
import KanaInput from './KanaInput';
import KanjiDetails from './KanjiDetails';

// Define the KanjiItem interface
interface KanjiItem {
  id: number;
  level: number;
  kanji: string;
  onyomi: {
    reading: string;
    primary: boolean;
    accepted_answer: boolean;
    type: string;
  }[];
  kunyomi: {
    reading: string;
    primary: boolean;
    accepted_answer: boolean;
    type: string;
  }[];
  meanings: {
    meaning: string;
    primary: boolean;
    accepted_answer: boolean;
  }[];
}

function Kanji() {
  const level = useSettingsStore((state) => state.level);
  const { data, loading: loadingKanji, error: kanjiError } = useDataFiles<KanjiItem>('kanji');
  const { assignments, loading: loadingAssignments, error: assignmentsError } = useWanikaniAssignments();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isInputValid, setIsInputValid] = useState<boolean | null>(null);

  // Filter kanji data to only show items that have been started
  const filteredData = useMemo(() => {
    if (!data || !assignments) return null;

    // Get the subject_ids of kanji assignments that have been started
    const startedKanjiIds = assignments
      .filter(assignment => assignment.data.subject_type === 'kanji')
      .map(assignment => assignment.data.subject_id);

    // Filter the kanji data to only include items whose IDs are in the startedKanjiIds array
    return data.filter(item => startedKanjiIds.includes(item.id));
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
    setUserInput(''); // Reset input when selecting a new kanji
    setIsInputValid(null); // Reset validation status
  }, []);

  // Get valid readings for the currently selected kanji
  const getValidReadings = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const currentKanji = filteredData[selectedIndex];

    // Get all readings with accepted_answer=true from both onyomi and kunyomi
    const validOnyomi = currentKanji.onyomi
      .filter(reading => reading.accepted_answer)
      .map(reading => reading.reading);

    const validKunyomi = currentKanji.kunyomi
      .filter(reading => reading.accepted_answer)
      .map(reading => reading.reading);

    return [...validOnyomi, ...validKunyomi];
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
  const loading = loadingKanji || loadingAssignments;
  const error = kanjiError || assignmentsError;

  return (
    <div className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-4">Kanji Practice (Level {level})</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full">
        {loading && (
          <p className="text-gray-700">Loading kanji data...</p>
        )}

        {error && (
          <p className="text-red-500">Error loading kanji data: {error.message}</p>
        )}

        {!loading && !error && filteredData && (
          <div>
            <p className="text-gray-700 mb-4">
              Showing {filteredData.length} started kanji characters for level {level}.
            </p>
            <div className="grid gap-2 auto-rows-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}>
              {filteredData.map((item, index) => (
                <div
                  key={item.id}
                  className={`border p-2 text-center text-2xl cursor-pointer transition-colors ${selectedIndex === index ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'}`}
                  onClick={() => handleItemClick(index)}
                >
                  {item.kanji}
                </div>
              ))}
            </div>

            {/* Display currently active kanji */}
            {filteredData.length > 0 && (
              <div className="mt-8 p-4 border rounded-lg bg-white shadow-md">
                <h2 className="text-xl font-bold mb-2">Currently Active Kanji</h2>
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-4">{filteredData[selectedIndex].kanji}</div>

                  {/* Reading input section */}
                  <div className="w-full max-w-md mb-4">
                    <label htmlFor="kanji-reading" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Reading:
                    </label>
                    <KanaInput
                      id="kanji-reading"
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

                  {/* Kanji Details Table */}
                  <KanjiDetails kanji={filteredData[selectedIndex]} />

                  <p className="text-gray-600">
                    Use arrow keys to navigate or click on a kanji above.
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

export default Kanji;
