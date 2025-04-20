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
    validReadings: string[];
    onInputChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
}

const ActiveVocabularyBlock: FC<Readonly<ActiveVocabularyBlockProps>> = ({
    vocabulary,
    position,
    userInput,
    validReadings,
    onInputChange,
    onValidate
}) => {
    const ref = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        ref.current?.focus();
    }, [vocabulary]);

    return (
        <div className="mb-8 p-4">
            <div className="flex flex-col items-center">
                <div className="mt-4">{position}</div>
                <div className="text-9xl mb-8 mt-4 p-4 border rounded-lg">{vocabulary.word}</div>

                {/* Reading input section */}
                <div className="w-full max-w-md mb-4">
                    <label htmlFor="vocabulary-reading"
                           className="block text-sm font-medium mb-1">
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
                </div>

                {/* Vocabulary Details Table */}
                <VocabularyDetails vocabulary={vocabulary}/>
            </div>
        </div>
    );
};

export default ActiveVocabularyBlock;
