import { type FC, useCallback, useEffect, useState } from 'react';
import { isKatakana, toHiragana } from 'wanakana';
import { WanikaniReading } from '../../wanikani';
import { formatHint } from '../../utils/formatHint.ts';
import { Composition } from './Composition.tsx';
import { isKanaVocabulary, isVocabulary } from '../../utils/typeChecks.ts';
import { useItems } from '../../hooks/useItems.ts';
import { useKanjiComposition } from '../../hooks/useKanjiComposition.ts';
import useGlobalEvent from 'beautiful-react-hooks/useGlobalEvent';

export const InfoTable: FC = () => {
  const { currentItem, isValid } = useItems();
  const vocabulary =
    isVocabulary(currentItem) || isKanaVocabulary(currentItem) ? currentItem : null;
  const [show, setShow] = useState(isValid ?? false);
  const [firstKanji, ...moreKanji] = useKanjiComposition();

  const toggle = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  useEffect(() => {
    setShow(isValid ?? false);
  }, [isValid, currentItem]);

  const onKeyDown = useGlobalEvent<KeyboardEvent>('keydown');
  onKeyDown((e) => {
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
              <tr>
                <th scope="col" className="table-header" rowSpan={2}>
                  Reading
                </th>
                <th scope="col" className="table-header" rowSpan={2}>
                  Meanings
                </th>
                <th scope="colgroup" className="table-header-composition" colSpan={4}>
                  Composition
                </th>
              </tr>
              <tr>
                <th scope="col" className="table-header-composition-2">
                  Kanji
                </th>
                <th scope="col" className="table-header-composition-2">
                  Onyomi
                </th>
                <th scope="col" className="table-header-composition-2">
                  Kunyomi
                </th>
                <th scope="col" className="table-header-composition-2">
                  Meaning
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="table-content" lang="ja" rowSpan={moreKanji.length + 1}>
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
                <td className="table-content" rowSpan={moreKanji.length + 1}>
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
                  <td colSpan={4} className="table-content text-center text-gray-500">
                    No Kanji in vocabulary.
                  </td>
                )}
                {firstKanji && <Composition kanji={firstKanji} className="table-content" />}
              </tr>
              {moreKanji.map((kanji) => (
                <tr key={kanji.id}>
                  <Composition kanji={kanji} className="table-content text-nowrap" />
                </tr>
              ))}
            </tbody>
          </table>

          {isVocabulary(vocabulary) && vocabulary.data.reading_mnemonic && (
            <div className="flex items-center justify-around">
              <table className="max-w-full text-left lg:max-w-3/4">
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
