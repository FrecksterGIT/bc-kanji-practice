import { FC } from 'react';
import useKanjiComposition from '../../hooks/useKanjiComposition.ts';

type CompositionProps = {
  word: string;
};

export const Composition: FC<CompositionProps> = ({ word }) => {
  const { kanjiData, loading: loadingKanji } = useKanjiComposition(word);

  return (
    <table className="max-w-min divide-y divide-gray-200 text-left">
      <thead>
        <tr className="text-xs font-medium uppercase">
          <th scope="col" className="px-2 pb-2 tracking-wider">
            Kanji
          </th>
          <th scope="col" className="px-2 pb-2 tracking-wider">
            Onyomi
          </th>
          <th scope="col" className="px-2 pb-2 tracking-wider">
            Kunyomi
          </th>
          <th scope="col" className="px-2 pb-2 tracking-wider">
            Meaning
          </th>
        </tr>
      </thead>
      <tbody>
        {kanjiData.size === 0 ? (
          <tr>
            <td colSpan={4} className="px-2 pt-2 text-center text-gray-500">
              {loadingKanji ? 'Loading...' : 'No Kanji in vocabulary.'}
            </td>
          </tr>
        ) : (
          [...word].map((char) => {
            const kanjiItem = kanjiData.get(char);
            if (!kanjiItem) return null;

            return (
              <tr key={kanjiItem.id}>
                <td className="px-2 pt-2 whitespace-nowrap text-white">{kanjiItem.kanji}</td>
                <td className="px-2 pt-2 whitespace-nowrap">
                  {kanjiItem.onyomi.map((reading) => (
                    <span
                      key={reading.reading}
                      className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                    >
                      {reading.reading}
                    </span>
                  ))}
                </td>
                <td className="px-2 pt-2 whitespace-nowrap">
                  {kanjiItem.kunyomi.map((reading) => (
                    <span
                      key={reading.reading}
                      className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                    >
                      {reading.reading}
                    </span>
                  ))}
                </td>
                <td className="px-2 pt-2 whitespace-nowrap">
                  {kanjiItem.meanings.map((meaning) => (
                    <span
                      key={meaning.meaning}
                      className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
                    >
                      {meaning.meaning}
                    </span>
                  ))}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
