export interface WanikaniResourceResponse<T> {
  object: string;
  url: string;
  data_updated_at: string;
  data: T;
}

export type WanikaniUserResponse = WanikaniResourceResponse<WanikaniUserData>;

export interface WanikaniUserData {
  id: string;
  username: string;
  level: number;
  profile_url: string;
  started_at: string;
  current_vacation_started_at: string | null;
  subscription: WanikaniSubscription;
  preferences: WanikaniPreferences;
}

export interface WanikaniSubscription {
  active: boolean;
  type: string;
  max_level_granted: number;
  period_ends_at: string;
}

export interface WanikaniPreferences {
  default_voice_actor_id: number;
  extra_study_autoplay_audio: boolean;
  lessons_autoplay_audio: boolean;
  lessons_batch_size: number;
  lessons_presentation_order: string;
  reviews_autoplay_audio: boolean;
  reviews_display_srs_indicator: boolean;
  reviews_presentation_order: string;
}

export interface WanikaniAssignment {
  id: number;
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    created_at: Date | null;
    subject_id: number;
    subject_type: string;
    level: number;
    srs_stage: number;
    unlocked_at: Date | null;
    started_at: Date | null;
    passed_at: Date | null;
    burned_at: Date | null;
    available_at: Date | null;
    resurrected_at: string | null;
    hidden: boolean;
  };
}

export type WanikaniSubject =
  | WanikaniKanjiSubject
  // | WanikaniRadicalSubject
  | WanikaniVocabularySubject
  | WanikaniKanaVocabularySubject;

export interface WanikaniBaseSubject {
  id: number;
  object: string;
  url: string;
  data_updated_at: string;
  data: {
    created_at: string;
    level: number;
    slug: string;
    hidden_at: string | null;
    document_url: string;
  };
}

export interface WanikaniKanjiSubject extends WanikaniBaseSubject {
  data: WanikaniBaseSubject['data'] & {
    subject_type: 'kanji';
    characters: string;
    meanings: WanikaniMeaning[];
    readings: WanikaniReading[];
    component_subject_ids: number[];
    amalgamation_subject_ids: number[];
    visually_similar_subject_ids: number[];
    meaning_mnemonic: string;
    meaning_hint: string | null;
    reading_mnemonic: string;
    reading_hint: string | null;
  };
}

export interface WanikaniRadicalSubject extends WanikaniBaseSubject {
  data: WanikaniBaseSubject['data'] & {
    subject_type: 'radical';
    characters: string | null;
    character_images: WanikaniCharacterImage[];
    meanings: WanikaniMeaning[];
    amalgamation_subject_ids: number[];
    meaning_mnemonic: string;
    meaning_hint: string | null;
  };
}

export interface WanikaniVocabularySubject extends WanikaniBaseSubject {
  data: WanikaniBaseSubject['data'] & {
    subject_type: 'vocabulary';
    characters: string;
    meanings: WanikaniMeaning[];
    readings: WanikaniReading[];
    component_subject_ids: number[];
    context_sentences: WanikaniContextSentence[];
    pronunciation_audios: WanikaniPronunciationAudio[];
    meaning_mnemonic: string;
    meaning_hint: string | null;
    reading_mnemonic: string;
    reading_hint: string | null;
    parts_of_speech: string[];
  };
}

export interface WanikaniKanaVocabularySubject extends WanikaniBaseSubject {
  data: WanikaniBaseSubject['data'] & {
    subject_type: 'kana_vocabulary';
    characters: string;
    meanings: WanikaniMeaning[];
    context_sentences: WanikaniContextSentence[];
    pronunciation_audios: WanikaniPronunciationAudio[];
    meaning_mnemonic: string;
    meaning_hint: string | null;
    parts_of_speech: string[];
  };
}

export interface WanikaniMeaning {
  meaning: string;
  primary: boolean;
  accepted_answer: boolean;
}

export interface WanikaniReading {
  type: 'kunyomi' | 'onyomi' | 'nanori';
  primary: boolean;
  accepted_answer: boolean;
  reading: string;
}

export interface WanikaniCharacterImage {
  url: string;
  content_type: string;
  metadata: {
    inline_styles: boolean;
    color: string;
    dimensions: string;
    style_name: string;
  };
}

export interface WanikaniContextSentence {
  en: string;
  ja: string;
}

export interface WanikaniPronunciationAudio {
  url: string;
  content_type: string;
  metadata: {
    gender: string;
    source_id: number;
    pronunciation: string;
    voice_actor_id: number;
    voice_actor_name: string;
    voice_description: string;
  };
}
