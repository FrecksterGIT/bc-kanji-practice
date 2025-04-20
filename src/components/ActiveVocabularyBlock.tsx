import {type FC, useEffect, useRef} from 'react';
import KanaInput from './KanaInput';
import VocabularyDetails from './VocabularyDetails';
import {useSession} from "../contexts/SessionContext.tsx";
import {VocabularyItem} from '../types';

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
    const {speak} = useSession()

    useEffect(() => {
        ref.current?.focus();
    }, [vocabulary]);

    return (
        <div className="mb-6">
            <div className="flex flex-col items-center">
                <div className="mb-12">{position}</div>
                <button
                    className="text-9xl mb-12 p-8 w-full text-center bg-gray-700 border-b-purple-400 border-b-2 text-white cursor-pointer"
                    onClick={() => speak(vocabulary.word)}>
                    {vocabulary.word}
                </button>

                {/* Reading input section */}
                <div className="w-full max-w-1/2 mb-12">
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
