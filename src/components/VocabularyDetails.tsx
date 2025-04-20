import {type FC} from "react";
import {isKatakana, toHiragana} from "wanakana";

interface Reading {
    reading: string;
    primary: boolean;
}

interface Meaning {
    meaning: string;
    primary: boolean;
}

interface VocabularyDetailsProps {
    vocabulary: {
        word: string;
        reading: Reading[];
        meanings: Meaning[];
    };
}

const VocabularyDetails: FC<VocabularyDetailsProps> = ({vocabulary}) => {
    const getReading = (reading: string) => {
        const containsKatakana = reading.split("").some(isKatakana);
        if (containsKatakana) {
            return `${reading} (${reading.split("").map(c => toHiragana(c)).join("")})`;
        }
        return reading;
    }

    return (
        <div className="min-w-2/3">
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
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VocabularyDetails;
