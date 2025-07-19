import { FC } from 'react';
import { WanikaniKanjiSubject } from '../../wanikani';
import { TermListEntry } from '../shared/TermListEntry.tsx';

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
            <TermListEntry key={reading.reading} word={reading.reading} primary={reading.primary} />
          ))}
      </td>
      <td className={className} lang="ja">
        {kanji.data.readings
          .filter((r) => r.type === 'kunyomi')
          .map((reading) => (
            <TermListEntry key={reading.reading} word={reading.reading} primary={reading.primary} />
          ))}
      </td>
      <td className={className}>
        {kanji.data.meanings.map((meaning) => (
          <TermListEntry key={meaning.meaning} word={meaning.meaning} primary={meaning.primary} />
        ))}
      </td>
    </>
  );
};
