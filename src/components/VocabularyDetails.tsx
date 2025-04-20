import {type FC} from "react";
import {isKatakana, toHiragana} from "wanakana";
import {VocabularyItem} from '../types';
import {useKanjiComposition} from '../hooks/useKanjiComposition';
import {useToggle} from "usehooks-ts";

interface VocabularyDetailsProps {
    vocabulary: VocabularyItem;
}

const VocabularyDetails: FC<VocabularyDetailsProps> = ({vocabulary}) => {
    const {kanjiData, loading: loadingKanji} = useKanjiComposition(vocabulary.word);
    const [show, toggle] = useToggle(false)

    const getReading = (reading: string) => {
        const containsKatakana = reading.split("").some(isKatakana);
        if (containsKatakana) {
            return `${reading} (${reading.split("").map(c => toHiragana(c)).join("")})`;
        }
        return reading;
    }

    return (
        <button className={`min-w-2/3 ${show ? 'cursor-zoom-out' : 'blur-md cursor-zoom-in'}`} onClick={() => toggle()}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Reading
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Meanings
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Composition
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {vocabulary.reading.map((reading, index) => (
                                <span
                                    key={index}
                                    className={`separated-comma ${reading.primary ? 'font-bold text-white' : ''}`}
                                >{getReading(reading.reading)}</span>
                            ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {vocabulary.meanings.map((meaning, index) => (
                                <span
                                    key={index}
                                    className={`separated-comma ${meaning.primary ? 'font-bold text-white' : ''}`}
                                >{meaning.meaning}</span>
                            ))}
                        </td>
                        <td className="pl-6 py-4 whitespace-nowrap">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                <tr>
                                    <th scope="col"
                                        className="px-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Kanji
                                    </th>
                                    <th scope="col"
                                        className="px-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Onyomi
                                    </th>
                                    <th scope="col"
                                        className="px-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Kunyomi
                                    </th>
                                    <th scope="col"
                                        className="px-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Meaning
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {kanjiData.size === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-2 text-center text-gray-500">
                                            {loadingKanji ? 'Loading...' : 'No Kanji in vocabulary word.'}
                                        </td>
                                    </tr>
                                )}
                                {[...vocabulary.word].map((char, index) => {
                                    const kanjiItem = kanjiData.get(char);
                                    if (!kanjiItem) return null;

                                    return (
                                        <tr key={index}>
                                            <td className="px-2 whitespace-nowrap text-white">
                                                {kanjiItem.kanji}
                                            </td>
                                            <td className="px-2 whitespace-nowrap">
                                                {kanjiItem.onyomi.map((reading, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                                                    >{reading.reading}</span>
                                                ))}
                                            </td>
                                            <td className="px-2 whitespace-nowrap">
                                                {kanjiItem.kunyomi.map((reading, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                                                    >{reading.reading}</span>
                                                ))}
                                            </td>
                                            <td className="px-2 whitespace-nowrap">
                                                {kanjiItem.meanings.map((meaning, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
                                                    >{meaning.meaning}</span>
                                                ))}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </button>
    );
};

export default VocabularyDetails;
