import React from 'react';

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

const KanjiDetails: React.FC<KanjiDetailsProps> = ({ kanji }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Kanji Details</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Onyomi
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kunyomi
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meanings
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  {kanji.onyomi.map((reading, index) => (
                    <span
                      key={index}
                      className={`${reading.primary ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                    >
                      {reading.reading}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  {kanji.kunyomi.map((reading, index) => (
                    <span
                      key={index}
                      className={`${reading.primary ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                    >
                      {reading.reading}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  {kanji.meanings.map((meaning, index) => (
                    <span
                      key={index}
                      className={`${meaning.primary ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                    >
                      {meaning.meaning}
                    </span>
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

export default KanjiDetails;
