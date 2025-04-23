import {type FC, useEffect, useRef} from 'react';
import KanaInput from './KanaInput';
import KanjiDetails from './KanjiDetails';
import {useRelatedVocabulary} from '../hooks/useRelatedVocabulary';
import {KanjiItem} from '../types';
import {Mark} from './Mark';

interface ActiveKanjiBlockProps {
    kanji: KanjiItem;
    position: string;
    userInput: string;
    validReadings: string[];
    onInputChange: (value: string) => void;
    onValidate: (isValid: boolean) => void;
    isValid: boolean | null;
}

const ActiveKanjiBlock: FC<Readonly<ActiveKanjiBlockProps>> = ({
                                                                   kanji,
                                                                   position,
                                                                   userInput,
                                                                   validReadings,
                                                                   onInputChange,
                                                                   onValidate,
                                                                   isValid
                                                               }) => {
    const ref = useRef<HTMLInputElement | null>(null)
    const {relatedVocabulary, loading: vocabularyLoading, error: vocabularyError} = useRelatedVocabulary(kanji.kanji)

    useEffect(() => {
        ref.current?.focus();
    }, [kanji]);

    return (
        <div className="mb-6">
            <div className="flex flex-col items-center">
                <div className="mb-12">{position}</div>
                <div
                    className="text-9xl mb-12 p-8 w-full text-center bg-gray-700 border-b-pink-400 border-b-2 text-white">{kanji.kanji}</div>

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

                {/* Related Vocabulary List */}
                <div className="mb-8 w-full">
                    {vocabularyLoading && (
                        <p>Loading related vocabulary...</p>
                    )}

                    {vocabularyError && (
                        <p className="text-red-500">Error loading related vocabulary: {vocabularyError.message}</p>
                    )}

                    {!vocabularyLoading && !vocabularyError && relatedVocabulary.length === 0 && (
                        <p>No related vocabulary found.</p>
                    )}

                    {!vocabularyLoading && !vocabularyError && relatedVocabulary.length > 0 && (
                        <div className="flex gap-x-1 gap-y-4 flex-wrap justify-center">
                            {relatedVocabulary.map((vocab) => {
                                const reading = vocab.reading.find(r => r.primary)?.reading ?? vocab.reading[0]?.reading;
                                const meaning = vocab.meanings.find(m => m.primary)?.meaning ?? vocab.meanings[0]?.meaning;

                                return (
                                    <div key={vocab.id}>
                                        <Mark

                                            level={vocab.level}
                                            meaning={meaning}
                                            word={vocab.word}
                                            reading={reading}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Kanji Details Table */}
                <KanjiDetails kanji={kanji} isValid={isValid} />
            </div>
        </div>
    );
};

export default ActiveKanjiBlock;
