import { type FC, useCallback, useContext, useRef } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import InfoTable from './InfoTable.tsx';
import { ValidationContext } from '../../contexts/ValidationContext.tsx';
import MarkButton from '../shared/MarkButton.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';
import { isKanaVocabulary, isVocabulary } from '../../utils/type-check.ts';
import { Audio } from '../shared/icons/Audio.tsx';

const VocabularyDetails: FC = () => {
  const { item, selectedIndex, items } = useContext(ValidationContext);
  const vocabulary = isVocabulary(item) || isKanaVocabulary(item) ? item : null;
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().then();
    }
  }, []);

  return (
    vocabulary && (
      <div className="mb-6">
        <div className="flex flex-col items-center">
          <div className="mb-12">
            {selectedIndex + 1} / {items.length}
          </div>
          <div className="relative p-8 w-full text-center bg-gray-700 border-b-purple-400 border-b-2 text-white">
            <div className="text-9xl">{vocabulary.data.characters}</div>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={playAudio} className="cursor-pointer">
                <Audio />
              </button>
              <MarkButton />
            </div>
          </div>
          <audio ref={audioRef} key={vocabulary.url}>
            {vocabulary.data.pronunciation_audios
              .filter((a) => a.metadata.gender === 'male')
              .map((a) => (
                <source key={a.url} src={a.url} type={a.content_type} />
              ))}
          </audio>
          <ProgressBar />
          <div className="w-full max-w-1/2 my-12">
            <KanaInput id="reading" />
          </div>
          <InfoTable />
        </div>
      </div>
    )
  );
};

export default VocabularyDetails;
