import {type FC, useEffect, useRef} from 'react';
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

interface ActiveKanjiBlockProps {
    kanji: KanjiItem;
    position: string;
    userInput: string;
    isInputValid: boolean | null;
    validReadings: string[];
    onInputChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
}

const ActiveKanjiBlock: FC<Readonly<ActiveKanjiBlockProps>> = ({
    kanji,
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
    }, [kanji]);

    return (
        <div className="mb-8 p-4 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold mb-2">Currently Active Kanji</h2>
            <div className="flex flex-col items-center">
                <div>{position}</div>
                <div className="text-5xl mb-4">{kanji.kanji}</div>

                <div className="w-full max-w-md mb-4">
                    <label htmlFor="kanji-reading"
                           className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Reading:
                    </label>
                    <KanaInput
                        id="kanji-reading"
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

                {/* Kanji Details Table */}
                <KanjiDetails kanji={kanji}/>
            </div>
        </div>
    );
};

export default ActiveKanjiBlock;
