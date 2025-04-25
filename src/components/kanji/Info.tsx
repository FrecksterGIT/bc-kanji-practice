import { type FC, useEffect } from 'react';
import { KanjiItem } from '../../types';
import { useToggle } from 'usehooks-ts';
import { formatHint } from '../../utils/hintFormatter.ts';

interface InfoProps {
  kanji: KanjiItem;
  isValid: boolean | null;
}

const Info: FC<InfoProps> = ({ kanji, isValid }) => {
  const [show, toggle, set] = useToggle(false);

  useEffect(() => {
    set(false);
  }, [set, kanji]);

  useEffect(() => {
    if (isValid) {
      set(true);
    }
  }, [set, isValid]);

  return (
    <button
      className={`min-w-2/3 ${show ? 'cursor-zoom-out' : 'blur-md cursor-zoom-in'}`}
      onClick={() => toggle()}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border-b-gray-200 border-b-1 text-left mb-6">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Onyomi
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                Kunyomi
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
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
                  >
                    {reading.reading}
                  </span>
                ))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {kanji.kunyomi.map((reading) => (
                  <span
                    key={reading.reading}
                    className={`separated-comma ${reading.primary ? 'font-bold text-white' : ''}`}
                  >
                    {reading.reading}
                  </span>
                ))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {kanji.meanings.map((meaning) => (
                  <span
                    key={meaning.meaning}
                    className={`separated-comma ${meaning.primary ? 'font-bold text-white' : ''}`}
                  >
                    {meaning.meaning}
                  </span>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="min-w-full text-left">
          <tbody>
            <tr>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-nowrap">
                Meaning Mnemonic
              </th>
              <td
                className="px-6 py-4"
                dangerouslySetInnerHTML={{ __html: formatHint(kanji.meaning_mnemonic) }}
              />
            </tr>
            <tr>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-nowrap">
                Reading Mnemonic
              </th>
              <td className="px-6 py-4">
                <p dangerouslySetInnerHTML={{ __html: formatHint(kanji.reading_mnemonic) }}></p>
                <p
                  className="text-sm text-gray-500"
                  dangerouslySetInnerHTML={{ __html: formatHint(kanji.reading_hint) }}
                ></p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </button>
  );
};

export default Info;
