import { type FC, useEffect } from 'react';
import { isKatakana, toHiragana } from 'wanakana';
import { WanikaniReading } from '../../wanikani';
import { useEventListener, useToggle } from 'usehooks-ts';
import { formatHint } from '../../utils/formatHint.ts';
import { Composition } from './Composition.tsx';
import { isKanaVocabulary, isVocabulary } from '../../utils/typeChecks.ts';
import useItems from '../../hooks/useItems.ts';

const InfoTable: FC = () => {
  const { item, isValid } = useItems();
  const vocabulary = isVocabulary(item) || isKanaVocabulary(item) ? item : null;
  const [show, toggle, set] = useToggle(isValid ?? false);

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
        <div className="min-h-[7rem] overflow-x-auto">
          <table className="mb-6 min-w-full divide-y divide-gray-200 border-b-1 border-b-gray-200 text-left">
            <thead>
              <tr className="text-xs font-medium uppercase">
                <th scope="col" className="px-6 py-3 tracking-wider">
                  Reading
                </th>
                <th scope="col" className="px-6 py-3 tracking-wider">
                  Meanings
                </th>
                <th scope="col" className="w-px px-6 py-3 tracking-wider">
                  Composition
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap" lang="ja">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {vocabulary.data.meanings.map((meaning) => (
                    <span
                      key={meaning.meaning}
                      className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
                    >
                      {meaning.meaning}
                    </span>
                  ))}
                </td>
                <td className="py-4 pl-6 whitespace-nowrap">
                  <Composition />
                </td>
              </tr>
            </tbody>
          </table>
          {isVocabulary(vocabulary) && vocabulary.data.reading_mnemonic && (
            <table className="min-w-full text-left">
              <tbody>
                <tr>
                  <th className="px-6 py-4 align-top text-xs leading-6 font-medium tracking-wider text-nowrap uppercase">
                    Reading Mnemonic
                  </th>
                  <td className="px-6 py-4 align-top">
                    <p
                      className="max-w-2/3"
                      dangerouslySetInnerHTML={{
                        __html: formatHint(vocabulary.data.reading_mnemonic),
                      }}
                    ></p>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </button>
    )
  );
};

export default InfoTable;
