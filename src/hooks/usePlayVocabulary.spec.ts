import { describe, expect, it } from "vite-plus/test";
import { pickPronunciation } from "../hooks/usePlayVocabulary.ts";
import { WanikaniPronunciationAudio } from "../wanikani";

const audio = (url: string, content_type: string, gender: string): WanikaniPronunciationAudio => ({
  url,
  content_type,
  metadata: {
    gender,
    source_id: 1,
    pronunciation: "x",
    voice_actor_id: 1,
    voice_actor_name: "x",
    voice_description: "x",
  },
});

describe("pickPronunciation", () => {
  it("prefers a male mpeg recording", () => {
    const picked = pickPronunciation([
      audio("female.mp3", "audio/mpeg", "female"),
      audio("male.mp3", "audio/mpeg", "male"),
      audio("male.ogg", "audio/ogg", "male"),
    ]);
    expect(picked?.url).toBe("male.mp3");
  });

  it("falls back to any mpeg when no male mpeg exists", () => {
    const picked = pickPronunciation([
      audio("male.ogg", "audio/ogg", "male"),
      audio("female.mp3", "audio/mpeg", "female"),
    ]);
    expect(picked?.url).toBe("female.mp3");
  });

  it("falls back to the first available recording when there is no mpeg", () => {
    const picked = pickPronunciation([audio("only.ogg", "audio/ogg", "female")]);
    expect(picked?.url).toBe("only.ogg");
  });

  it("returns undefined when there are no recordings", () => {
    expect(pickPronunciation([])).toBeUndefined();
    expect(pickPronunciation(undefined)).toBeUndefined();
  });
});
