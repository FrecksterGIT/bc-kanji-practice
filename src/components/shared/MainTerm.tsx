import { FC } from 'react';

import { Audio } from './icons/Audio.tsx';
import MarkButton from './MarkButton.tsx';
import useItems from '../../hooks/useItems.ts';
import { isKanji, isVocabulary } from '../../utils/typeChecks.ts';
import { usePlayVocabulary } from '../../hooks/usePlayVocabulary.ts';

const MainTerm: FC = () => {
  const { item } = useItems();
  const isVocab = isVocabulary(item);
  const borderColor = isKanji(item) ? 'border-b-pink-400' : 'border-b-purple-400';
  const { playAudio } = usePlayVocabulary(item);

  return (
    <div
      className={`relative w-full border-b-2 bg-gray-700 p-8 text-center text-white ${borderColor}`}
    >
      <div className="text-9xl" lang="ja">
        {item.data.characters}
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        {isVocab && (
          <button onClick={playAudio} className="cursor-pointer">
            <Audio />
          </button>
        )}
        <MarkButton />
      </div>
    </div>
  );
};

export default MainTerm;
