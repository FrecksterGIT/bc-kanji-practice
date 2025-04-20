import {type FC} from "react";

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
    return (
        <div className="mt-4 min-w-2/3">
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
                            <div className="flex flex-row gap-2">
                                {vocabulary.reading.map((reading, index) => (
                                    <span
                                        key={index}
                                        className={`${reading.primary ? 'font-bold' : ''}`}
                                    >
                      {reading.reading}
                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-row gap-2">
                                {vocabulary.meanings.map((meaning, index) => (
                                    <span
                                        key={index}
                                        className={`${meaning.primary ? 'font-bold' : ''}`}
                                    >{meaning.meaning}</span>
                                ))}
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VocabularyDetails;
