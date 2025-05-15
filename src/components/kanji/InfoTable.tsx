import { type FC, useEffect } from 'react';
import { useEventListener, useToggle } from 'usehooks-ts';
import { formatHint } from '../../utils/formatHint.ts';
import { isKanji } from '../../utils/typeChecks.ts';
import { useItems } from '../../hooks/useItems.ts';

export const InfoTable: FC = () => {
  const { item, isValid } = useItems();
  const [show, toggle, set] = useToggle(isValid ?? false);
  const kanji = isKanji(item) ? item : null;

  useEffect(() => {
    set(isValid ?? false);
  }, [set, kanji, isValid]);

  useEventListener('keydown', (e) => {
    if (e.key === 's' && e.altKey) {
      toggle();
    }
  });

  return (
    kanji && (
      <button
        className={`w-full ${show ? 'cursor-zoom-out' : 'cursor-zoom-in blur-md'}`}
        onClick={() => toggle()}
      >
        <div className="overflow-x-auto">
          <table className="mb-6 min-w-full divide-y divide-gray-200 border-b-1 border-b-gray-200 text-left">
            <thead>
              <tr>
                <th scope="col" className="table-header">
                  Onyomi
                </th>
                <th scope="col" className="table-header">
                  Kunyomi
                </th>
                <th scope="col" className="table-header">
                  Meanings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap" lang="ja">
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
                <td className="px-6 py-4 whitespace-nowrap" lang="ja">
                  {kanji.data.readings
                    .filter((r) => r.type === 'kunyomi')
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
                  {kanji.data.meanings.map((meaning) => (
                    <span
                      key={meaning.meaning}
                      className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
                    >
                      {meaning.meaning}
                    </span>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center justify-around">
            <table className="max-w-3/4 text-left">
              <tbody>
                <tr>
                  <th className="meaning-header">Meaning Mnemonic</th>
                  <td className="meaning-content">
                    <p
                      dangerouslySetInnerHTML={{ __html: formatHint(kanji.data.meaning_mnemonic) }}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="meaning-header">Reading Mnemonic</th>
                  <td className="meaning-content">
                    <p
                      dangerouslySetInnerHTML={{ __html: formatHint(kanji.data.reading_mnemonic) }}
                    />
                    <p
                      className="text-sm text-gray-500"
                      dangerouslySetInnerHTML={{ __html: formatHint(kanji.data.reading_hint) }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </button>
    )
  );
};
