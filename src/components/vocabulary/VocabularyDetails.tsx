import { type FC, useCallback } from 'react';
import KanaInput from '../shared/KanaInput.tsx';
import InfoTable from './InfoTable.tsx';
import MarkButton from '../shared/MarkButton.tsx';
import { ProgressBar } from '../shared/ProgressBar.tsx';
import { isKanaVocabulary, isVocabulary } from '../../utils/typeChecks.ts';
import { Audio } from '../shared/icons/Audio.tsx';
import { useAudioPlayerContext } from 'react-use-audio-player';
import useItems from '../../hooks/useItems.ts';
import Sentence from './Sentence.tsx';

const VocabularyDetails: FC = () => {
  const { item, selectedIndex, items } = useItems();
  const vocabulary = isVocabulary(item) || isKanaVocabulary(item) ? item : null;
  const { load } = useAudioPlayerContext();

  const playAudio = useCallback(() => {
    if (!vocabulary) return;
    const url = vocabulary.data.pronunciation_audios.find(
      (a) => a.metadata.gender === 'male' && a.content_type === 'audio/mpeg'
    )?.url;
    if (url) {
      load(vocabulary.data.pronunciation_audios[1].url, {
        format: 'mp3',
        autoplay: true,
      });
    }
  }, [load, vocabulary]);

  return (
    vocabulary && (
      <div className="mb-6">
        <div className="flex flex-col items-center">
          <div className="mb-12">
            {selectedIndex + 1} / {items.length}
          </div>
          <div className="relative w-full border-b-2 border-b-purple-400 bg-gray-700 p-8 text-center text-white">
            <div className="text-9xl" lang="ja">
              {vocabulary.data.characters}
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={playAudio} className="cursor-pointer">
                <Audio />
              </button>
              <MarkButton />
            </div>
          </div>
          <ProgressBar />
          <div className="my-12 w-full max-w-1/2">
            <KanaInput id="reading" />
          </div>
          <div className="mb-12 grid w-full space-y-4">
            {vocabulary.data.context_sentences.map((sentence) => (
              <Sentence sentence={sentence} key={sentence.ja} />
            ))}
          </div>
          <InfoTable />
        </div>
      </div>
    )
  );
};

export default VocabularyDetails;
