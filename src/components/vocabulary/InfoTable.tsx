import { type FC, useEffect } from 'react';
import { isKatakana, toHiragana } from 'wanakana';
import { WanikaniReading } from '../../wanikani';
import { useEventListener, useToggle } from 'usehooks-ts';
import { formatHint } from '../../utils/formatHint.ts';
import { Composition } from './Composition.tsx';
import { isKanaVocabulary, isVocabulary } from '../../utils/typeChecks.ts';
import useItems from '../../hooks/useItems.ts';
import useKanjiComposition from '../../hooks/useKanjiComposition.ts';

const InfoTable: FC = () => {
  const { item, isValid } = useItems();
  const vocabulary = isVocabulary(item) || isKanaVocabulary(item) ? item : null;
  const [show, toggle, set] = useToggle(isValid ?? false);
  const [firstKanji, ...moreKanji] = useKanjiComposition();

  useEffect(() => {
    set(isValid ?? false);
  }, [set, vocabulary, isValid]);

  useEventListener('keydown', (e) => {
    if (e.key === 's' && e.altKey) {
      toggle();
    }
  });

  const getReading = (reading: string, allReadings: WanikaniReading[]) => {
    const containsKatakana = reading.split('').some(isKatakana);
    if (containsKatakana) {
      const pureHiragana = reading
        .split('')
        .map((c) => toHiragana(c))
        .join('');
      if (!allReadings.some((r) => r.reading === pureHiragana)) {
        return `${reading} (${pureHiragana})`;
      }
    }
    return reading;
  };

  return (
    vocabulary && (
      <button
        className={`w-full ${show ? 'cursor-zoom-out' : 'cursor-zoom-in blur-md'}`}
        onClick={() => toggle()}
      >
        <div className="overflow-x-auto">
          <table className="mb-6 min-w-full divide-y divide-gray-200 border-b-1 border-b-gray-200 text-left">
            <thead>
              <tr className="text-xs font-medium uppercase">
                <th scope="col" className="table-header" rowSpan={2}>
                  Reading
                </th>
                <th scope="col" className="table-header" rowSpan={2}>
                  Meanings
                </th>
                <th scope="colgroup" className="px-6 pt-3 tracking-wider" colSpan={4}>
                  Composition
                </th>
              </tr>
              <tr className="text-xs font-medium uppercase">
                <th scope="col" className="table-header-2">
                  Kanji
                </th>
                <th scope="col" className="table-header-2">
                  Onyomi
                </th>
                <th scope="col" className="table-header-2">
                  Kunyomi
                </th>
                <th scope="col" className="table-header-2">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="px-6 py-4 whitespace-nowrap"
                  lang="ja"
                  rowSpan={moreKanji.length + 1}
                >
                  {isVocabulary(vocabulary) &&
                    vocabulary.data.readings.map((reading) => (
                      <span
                        key={reading.reading}
                        className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                      >
                        {getReading(reading.reading, vocabulary.data.readings)}
                      </span>
                    ))}
                </td>
                <td className="px-6 py-4" rowSpan={moreKanji.length + 1}>
                  {vocabulary.data.meanings.map((meaning) => (
                    <span
                      key={meaning.meaning}
                      className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
                    >
                      {meaning.meaning}
                    </span>
                  ))}
                </td>
                {!firstKanji && (
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No Kanji in vocabulary.
                  </td>
                )}
                {firstKanji && (
                  <Composition kanji={firstKanji} className="px-6 py-4 whitespace-nowrap" />
                )}
              </tr>
              {moreKanji.map((kanji) => (
                <tr key={kanji.id}>
                  <Composition kanji={kanji} className="px-6 pb-4 whitespace-nowrap" />
                </tr>
              ))}
            </tbody>
          </table>

          {isVocabulary(vocabulary) && vocabulary.data.reading_mnemonic && (
            <div className="flex items-center justify-around">
              <table className="max-w-3/4 text-left">
                <tbody>
                  <tr>
                    <th className="meaning-header">Meaning Mnemonic</th>
                    <td className="meaning-content">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: formatHint(vocabulary.data.meaning_mnemonic),
                        }}
                      ></p>
                    </td>
                  </tr>
                  <tr>
                    <th className="meaning-header">Reading Mnemonic</th>
                    <td className="meaning-content">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: formatHint(vocabulary.data.reading_mnemonic),
                        }}
                      ></p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </button>
    )
  );
};

export default InfoTable;
