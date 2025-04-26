import { type FC, useEffect } from 'react';
import { isKatakana, toHiragana } from 'wanakana';
import { VocabularyItem } from '../../types';
import { useToggle } from 'usehooks-ts';
import { formatHint } from '../../utils/hintFormatter.ts';
import { Composition } from './Composition.tsx';

interface InfoProps {
  vocabulary: VocabularyItem;
  isValid: boolean | null;
}

const Info: FC<InfoProps> = ({ vocabulary, isValid }) => {
  const [show, toggle, set] = useToggle(isValid ?? false);

  useEffect(() => {
    set(isValid ?? false);
  }, [set, vocabulary.word, isValid]);

  const getReading = (reading: string, allReadings: VocabularyItem['reading']) => {
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
    <button
      className={`w-full ${show ? 'cursor-zoom-out' : 'blur-md cursor-zoom-in'}`}
      onClick={() => toggle()}
    >
      <div className="overflow-x-auto min-h-[7rem]">
        <table className="min-w-full divide-y divide-gray-200 border-b-gray-200 border-b-1 text-left mb-6">
          <thead>
            <tr className="text-xs font-medium uppercase">
              <th scope="col" className="px-6 py-3 tracking-wider">
                Reading
              </th>
              <th scope="col" className="px-6 py-3 tracking-wider">
                Meanings
              </th>
              <th scope="col" className="px-6 py-3 tracking-wider w-px">
                Composition
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                {vocabulary.reading.map((reading) => (
                  <span
                    key={reading.reading}
                    className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                  >
                    {getReading(reading.reading, vocabulary.reading)}
                  </span>
                ))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {vocabulary.meanings.map((meaning) => (
                  <span
                    key={meaning.meaning}
                    className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
                  >
                    {meaning.meaning}
                  </span>
                ))}
              </td>
              <td className="pl-6 py-4 whitespace-nowrap">
                <Composition word={vocabulary.word} />
              </td>
            </tr>
          </tbody>
        </table>
        {vocabulary.reading_mnemonic && (
          <table className="min-w-full text-left">
            <tbody>
              <tr>
                <th className="px-6 py-4 leading-6 text-xs font-medium uppercase text-nowrap tracking-wider align-top">
                  Reading Mnemonic
                </th>
                <td className="px-6 py-4 align-top">
                  <p
                    className="max-w-2/3"
                    dangerouslySetInnerHTML={{ __html: formatHint(vocabulary.reading_mnemonic) }}
                  ></p>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </button>
  );
};

export default Info;
