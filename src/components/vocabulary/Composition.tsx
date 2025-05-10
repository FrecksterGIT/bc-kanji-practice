import { FC } from 'react';
import { WanikaniKanjiSubject } from '../../wanikani';

type CompositionProps = {
  kanji: WanikaniKanjiSubject;
  className?: string;
};

export const Composition: FC<CompositionProps> = ({ kanji, className }) => {
  return (
    <>
      <td className={className} lang="ja">
        <span className="text-white">{kanji.data.characters}</span>
      </td>
      <td className={className} lang="ja">
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
      <td className={className} lang="ja">
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
      <td className={className}>
        {kanji.data.meanings.map((meaning) => (
          <span
            key={meaning.meaning}
            className={`separated-comma ${meaning.primary ? 'text-white' : ''}`}
          >
            {meaning.meaning}
          </span>
        ))}
      </td>
    </>
  );
};
