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
    validReadings: string[];
    onInputChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
}

const ActiveKanjiBlock: FC<Readonly<ActiveKanjiBlockProps>> = ({
    kanji,
    position,
    userInput,
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
            <div className="flex flex-col items-center">
                <div className="mt-4">{position}</div>
                <div className="text-8xl mb-4 mt-4">{kanji.kanji}</div>

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
                </div>

                {/* Kanji Details Table */}
                <KanjiDetails kanji={kanji}/>
            </div>
        </div>
    );
};

export default ActiveKanjiBlock;
