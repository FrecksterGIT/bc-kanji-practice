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
        <div className="mb-6">
            <div className="flex flex-col items-center">
                <div className="mb-12">{position}</div>
                <div className="text-9xl mb-12 p-8 w-full text-center bg-gray-700 border-b-pink-400 border-b-2 text-white">{kanji.kanji}</div>

                <div className="w-full max-w-1/2 mb-12">
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
