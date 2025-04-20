import {type FC} from "react";

interface Reading {
    reading: string;
    primary: boolean;
    accepted_answer: boolean;
    type: string;
}

interface Meaning {
    meaning: string;
    primary: boolean;
    accepted_answer: boolean;
}

interface KanjiDetailsProps {
    kanji: {
        kanji: string;
        onyomi: Reading[];
        kunyomi: Reading[];
        meanings: Meaning[];
    };
}

const KanjiDetails: FC<KanjiDetailsProps> = ({kanji}) => {
    return (
        <div className="min-w-2/3">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Onyomi
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Kunyomi
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
                            {kanji.onyomi.map((reading) => (
                                <span
                                    key={reading.reading}
                                    className={`separated-comma ${reading.primary ? 'font-bold text-white' : ''}`}
                                >{reading.reading}</span>
                            ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {kanji.kunyomi.map((reading) => (
                                <span
                                    key={reading.reading}
                                    className={`separated-comma ${reading.primary ? 'font-bold text-white' : ''}`}
                                >{reading.reading}</span>
                            ))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {kanji.meanings.map((meaning) => (
                                <span
                                    key={meaning.meaning}
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

export default KanjiDetails;
