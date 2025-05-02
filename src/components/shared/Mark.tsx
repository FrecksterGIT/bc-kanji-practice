import { FC, RefObject, useCallback, useRef } from 'react';
import { useHover } from 'usehooks-ts';
import { Tooltip } from './Tooltip.tsx';
import { WanikaniVocabularySubject } from '../../types';
import { useAudioPlayerContext } from 'react-use-audio-player';

interface MarkProps {
  vocabulary: WanikaniVocabularySubject;
}

export const Mark: FC<MarkProps> = ({ vocabulary }) => {
  const markRef = useRef<HTMLButtonElement>(null);
  const showTooltip = useHover(markRef as RefObject<HTMLButtonElement>);
  const { load } = useAudioPlayerContext();

  const playAudio = useCallback(() => {
    const url = vocabulary.data.pronunciation_audios.find(
      (a) => a.metadata.gender === 'male' && a.content_type === 'audio/mpeg'
    )?.url;
    if (url) {
      load(vocabulary.data.pronunciation_audios[1].url, {
        format: 'mp3',
        autoplay: true,
      });
    }
  }, [load, vocabulary.data.pronunciation_audios]);

  const level = vocabulary.data.level;
  const meaning = vocabulary.data.meanings[0].meaning;
  const word = vocabulary.data.characters;
  const reading = vocabulary.data.readings[0].reading;

  return (
    <button
      className="bg-purple-500 text-gray-800  px-1 rounded-sm mx-1 text-xl relative cursor-pointer flex items-end gap-2 text-nowrap"
      onClick={() => playAudio()}
      ref={markRef}
    >
      <span>{word}</span>
      <span className="text-sm">{level}</span>
      {showTooltip && (
        <Tooltip>
          {meaning}
          <br />
          {reading}
        </Tooltip>
      )}
    </button>
  );
};
