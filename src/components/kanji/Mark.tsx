import { FC, useRef } from 'react';
import { Tooltip } from '../shared/Tooltip.tsx';
import { WanikaniVocabularySubject } from '../../wanikani';
import { usePlayVocabulary } from '../../hooks/usePlayVocabulary.ts';
import { useHover } from '../../hooks/useHover.ts';

interface MarkProps {
  vocabulary: WanikaniVocabularySubject;
}

export const Mark: FC<MarkProps> = ({ vocabulary }) => {
  const markRef = useRef<HTMLButtonElement>(null);
  const showTooltip = useHover(markRef);
  const { playAudio } = usePlayVocabulary(vocabulary);

  const level = vocabulary.data.level;
  const meaning = vocabulary.data.meanings[0].meaning;
  const word = vocabulary.data.characters;
  const reading = vocabulary.data.readings[0].reading;

  return (
    <button className="mark" onClick={playAudio} ref={markRef}>
      <span lang="ja">{word}</span>
      <span className="text-sm">{level}</span>
      {showTooltip && (
        <Tooltip>
          {meaning}
          <br />
          <span lang="ja">{reading}</span>
        </Tooltip>
      )}
    </button>
  );
};
