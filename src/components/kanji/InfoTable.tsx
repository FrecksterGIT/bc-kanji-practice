import { type FC, useContext, useEffect } from 'react';
import { useToggle } from 'usehooks-ts';
import { formatHint } from '../../utils/hintFormatter.ts';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import { isKanji } from '../../utils/type-check.ts';

const InfoTable: FC = () => {
  const { item, isValid } = useContext(ValidationContext);
  const [show, toggle, set] = useToggle(isValid ?? false);
  const kanji = isKanji(item) ? item : null;

  useEffect(() => {
    set(isValid ?? false);
  }, [set, kanji, isValid]);

  return (
    kanji && (
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
                  {kanji.data.readings
                    .filter((r) => r.type === 'onyomi')
                    .map((reading) => (
                      <span
                        key={reading.reading}
                        className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                      >
                        {reading.reading}
                      </span>
                    ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {kanji.data.readings.filter(r => r.type === "kunyomi").map((reading) => (
                    <span
                      key={reading.reading}
                      className={`separated-comma ${reading.primary ? 'text-white' : ''}`}
                    >
                      {reading.reading}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {kanji.data.meanings.map((meaning) => (
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
                <th className="px-6 py-4 leading-6 text-xs font-medium uppercase text-nowrap tracking-wider align-top">
                  Meaning Mnemonic
                </th>
                <td className="px-6 py-4 align-top">
                  <p
                    className="max-w-2/3"
                    dangerouslySetInnerHTML={{ __html: formatHint(kanji.data.meaning_mnemonic) }}
                  />
                </td>
              </tr>
              <tr>
                <th className="px-6 py-4 leading-6 text-xs font-medium uppercase text-nowrap tracking-wider align-top">
                  Reading Mnemonic
                </th>
                <td className="px-6 py-4 align-top">
                  <p
                    className="max-w-2/3"
                    dangerouslySetInnerHTML={{ __html: formatHint(kanji.data.reading_mnemonic) }}
                  />
                  <p
                    className="max-w-2/3 text-sm text-gray-500"
                    dangerouslySetInnerHTML={{ __html: formatHint(kanji.data.reading_hint) }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </button>
    )
  );
};

export default InfoTable;
