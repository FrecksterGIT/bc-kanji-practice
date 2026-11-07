import { FC, useRef } from "react";

import { Audio } from "./icons/Audio.tsx";
import { MarkButton } from "./MarkButton.tsx";
import { useItems } from "../../hooks/useItems.ts";
import { isKanaVocabulary, isKanji, isVocabulary } from "../../utils/typeChecks.ts";
import { usePlayVocabulary } from "../../hooks/usePlayVocabulary.ts";
import { useSwipe } from "../../hooks/useSwipe.ts";

export const MainTerm: FC = () => {
  const { currentItem, setSelectedIndex, items } = useItems();
  const hasAudio = isVocabulary(currentItem) || isKanaVocabulary(currentItem);
  const borderColor = isKanji(currentItem) ? "border-b-pink-400" : "border-b-purple-400";
  const { playAudio } = usePlayVocabulary(currentItem);
  const ref = useRef<HTMLDivElement>(null);

  useSwipe(ref, {
    onSwipeLeft: () => setSelectedIndex((prev) => (prev + 1) % items.length),
    onSwipeRight: () => setSelectedIndex((prev) => (prev - 1 + items.length) % items.length),
  });

  return (
    <div
      className={`relative w-full border-b-2 bg-gray-700 p-8 text-center text-white ${borderColor}`}
      ref={ref}
    >
      <div className="text-9xl" lang="ja">
        {currentItem.data.characters}
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        {hasAudio && (
          <button onClick={playAudio} className="cursor-pointer">
            <Audio />
          </button>
        )}
        <MarkButton />
      </div>
    </div>
  );
};
