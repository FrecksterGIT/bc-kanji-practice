import { WanikaniPronunciationAudio, WanikaniSubject } from "../wanikani";
import { useAudioPlayerContext } from "react-use-audio-player";
import { useCallback } from "react";
import { isKanaVocabulary, isVocabulary } from "../utils/typeChecks.ts";

/**
 * Picks the best available pronunciation: male MP3 first, then any MP3,
 * then whatever WaniKani provides (e.g. OGG-only entries).
 */
export const pickPronunciation = (
  audios: WanikaniPronunciationAudio[] | undefined,
): WanikaniPronunciationAudio | undefined => {
  if (!audios?.length) return undefined;
  return (
    audios.find((a) => a.metadata.gender === "male" && a.content_type === "audio/mpeg") ??
    audios.find((a) => a.content_type === "audio/mpeg") ??
    audios[0]
  );
};

const formatFor = (contentType: string): string => (contentType === "audio/ogg" ? "ogg" : "mp3");

export const usePlayVocabulary = (subject: WanikaniSubject) => {
  const { load } = useAudioPlayerContext();

  const playAudio = useCallback(() => {
    if (!isVocabulary(subject) && !isKanaVocabulary(subject)) return;
    const audio = pickPronunciation(subject.data.pronunciation_audios);
    if (audio) {
      load(audio.url, {
        format: formatFor(audio.content_type),
        autoplay: true,
      });
    }
  }, [load, subject]);

  return { playAudio };
};
