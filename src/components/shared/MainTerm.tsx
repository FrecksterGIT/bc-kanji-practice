import { FC, RefObject, useEffect, useRef, useState } from 'react';

import { Audio } from './icons/Audio.tsx';
import { MarkButton } from './MarkButton.tsx';
import { useItems } from '../../hooks/useItems.ts';
import { isKanji, isVocabulary } from '../../utils/typeChecks.ts';
import { usePlayVocabulary } from '../../hooks/usePlayVocabulary.ts';
import useSwipe from 'beautiful-react-hooks/useSwipe';

export const MainTerm: FC = () => {
  const { currentItem, setSelectedIndex, items } = useItems();
  const isVocab = isVocabulary(currentItem);
  const borderColor = isKanji(currentItem) ? 'border-b-pink-400' : 'border-b-purple-400';
  const { playAudio } = usePlayVocabulary(currentItem);
  const ref = useRef<HTMLDivElement>(null);

  const swipe = useSwipe(ref as RefObject<HTMLDivElement>, {
    threshold: 100,
    direction: 'horizontal',
    passive: true,
    preventDefault: false,
  });
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (swipe.swiping && !isSwiping) {
      setIsSwiping(true);
    }
    if (isSwiping && !swipe.swiping) {
      setIsSwiping(false);
      if (swipe.direction === 'left') {
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (swipe.direction === 'right') {
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    }
  }, [isSwiping, items.length, setSelectedIndex, swipe]);

  return (
    <div
      className={`relative w-full border-b-2 bg-gray-700 p-8 text-center text-white ${borderColor}`}
      ref={ref}
    >
      <div className="text-9xl" lang="ja">
        {currentItem.data.characters}
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
