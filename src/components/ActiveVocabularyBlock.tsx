import {type FC, useEffect, useRef} from 'react';
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

interface ActiveVocabularyBlockProps {
    vocabulary: VocabularyItem;
    position: string;
    userInput: string;
    isInputValid: boolean | null;
    validReadings: string[];
    onInputChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
}

const ActiveVocabularyBlock: FC<Readonly<ActiveVocabularyBlockProps>> = ({
    vocabulary,
    position,
    userInput,
    isInputValid,
    validReadings,
    onInputChange,
    onValidate
}) => {
    const ref = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        ref.current?.focus();
    }, [vocabulary]);

    return (
        <div className="mb-8 p-4 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold mb-2">Currently Active Vocabulary</h2>
            <div className="flex flex-col items-center">
                <div>{position}</div>
                <div className="text-4xl mb-4">{vocabulary.word}</div>

                {/* Reading input section */}
                <div className="w-full max-w-md mb-4">
                    <label htmlFor="vocabulary-reading"
                           className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Reading:
                    </label>
                    <KanaInput
                        id="vocabulary-reading"
                        value={userInput}
                        onChange={onInputChange}
                        placeholder="Type the reading in hiragana..."
                        validValues={validReadings}
                        onValidate={onValidate}
                        ref={ref}
                    />

                    {/* Feedback message */}
                    {userInput && (
                        <p className={`mt-2 text-sm ${isInputValid ? 'text-green-600' : 'text-red-600'}`}>
                            {isInputValid
                                ? 'Correct reading!'
                                : 'Incorrect reading. Try again.'}
                        </p>
                    )}
                </div>

                {/* Vocabulary Details Table */}
                <VocabularyDetails vocabulary={vocabulary}/>
            </div>
        </div>
    );
};

export default ActiveVocabularyBlock;
