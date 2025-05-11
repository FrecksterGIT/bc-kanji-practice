import { WanikaniSubject } from '../wanikani';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useCallback } from 'react';
import { isVocabulary } from '../utils/typeChecks.ts';

export const usePlayVocabulary = (vocabulary: WanikaniSubject) => {
  const { load } = useAudioPlayerContext();

  const playAudio = useCallback(() => {
    if (!isVocabulary(vocabulary)) return;
    const url = vocabulary.data.pronunciation_audios.find(
      (a) => a.metadata.gender === 'male' && a.content_type === 'audio/mpeg'
    )?.url;
    if (url) {
      load(url, {
        format: 'mp3',
        autoplay: true,
      });
    }
  }, [load, vocabulary]);

  return { playAudio };
};
