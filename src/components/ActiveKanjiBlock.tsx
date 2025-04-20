import {type FC, useEffect, useRef} from 'react';
import KanaInput from './KanaInput';
import KanjiDetails from './KanjiDetails';
import {useRelatedVocabulary} from '../hooks/useRelatedVocabulary';
import {KanjiItem} from '../types';

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
    const { relatedVocabulary, loading: vocabularyLoading, error: vocabularyError } = useRelatedVocabulary(kanji.kanji)

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

                {/* Related Vocabulary List */}
                <div className="mt-8 w-full">
                    <h3 className="text-xl font-bold mb-4">Related Vocabulary</h3>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {relatedVocabulary.map((vocab) => (
                                <div key={vocab.id} className="p-4 bg-gray-700 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xl font-bold">{vocab.word}</span>
                                        <span className="text-sm bg-blue-500 px-2 py-1 rounded">Level {vocab.level}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-gray-300">Reading: </span>
                                        <span>{vocab.reading.find(r => r.primary)?.reading || vocab.reading[0]?.reading}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-300">Meaning: </span>
                                        <span>{vocab.meanings.find(m => m.primary)?.meaning || vocab.meanings[0]?.meaning}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveKanjiBlock;
