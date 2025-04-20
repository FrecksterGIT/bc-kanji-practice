// WaniKani API related types

// Common response structure
export interface WanikaniCollectionResponse<T> {
    object: string;
    url: string;
    pages: {
        per_page: number;
        next_url: string | null;
        previous_url: string | null;
    };
    total_count: number;
    data_updated_at: string;
    data: T[];
}

export interface WanikaniResourceResponse<T> {
    object: string;
    url: string;
    data_updated_at: string;
    data: T;
}

// User data types
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

// Assignments types
export type WanikaniAssignmentsResponse = WanikaniCollectionResponse<WanikaniAssignment>;

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

// Subject types
export type WanikaniSubjectsResponse = WanikaniCollectionResponse<WanikaniSubject>;

export type WanikaniSubject =
    | WanikaniKanjiSubject
    | WanikaniRadicalSubject
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

// Review Statistics types
export type WanikaniReviewStatisticsResponse = WanikaniCollectionResponse<WanikaniReviewStatistic>;

export interface WanikaniReviewStatistic {
    id: number;
    object: string;
    url: string;
    data_updated_at: string;
    data: {
        created_at: string;
        subject_id: number;
        subject_type: string;
        meaning_correct: number;
        meaning_incorrect: number;
        meaning_max_streak: number;
        meaning_current_streak: number;
        reading_correct: number;
        reading_incorrect: number;
        reading_max_streak: number;
        reading_current_streak: number;
        percentage_correct: number;
        hidden: boolean;
    };
}

// Study Materials types
export type WanikaniStudyMaterialsResponse = WanikaniCollectionResponse<WanikaniStudyMaterial>;

export interface WanikaniStudyMaterial {
    id: number;
    object: string;
    url: string;
    data_updated_at: string;
    data: {
        created_at: string;
        subject_id: number;
        subject_type: string;
        meaning_note: string | null;
        reading_note: string | null;
        meaning_synonyms: string[];
        hidden: boolean;
    };
}

// Summary types
export type WanikaniSummaryResponse = WanikaniResourceResponse<WanikaniSummary>;

export interface WanikaniSummary {
    lessons: WanikaniSummaryLesson[];
    next_reviews_at: string | null;
    reviews: WanikaniSummaryReview[];
}

export interface WanikaniSummaryLesson {
    available_at: string;
    subject_ids: number[];
}

export interface WanikaniSummaryReview {
    available_at: string;
    subject_ids: number[];
}

// Reviews types
export type WanikaniReviewsResponse = WanikaniCollectionResponse<WanikaniReview>;

export interface WanikaniReview {
    id: number;
    object: string;
    url: string;
    data_updated_at: string;
    data: {
        created_at: string;
        assignment_id: number;
        subject_id: number;
        starting_srs_stage: number;
        ending_srs_stage: number;
        incorrect_meaning_answers: number;
        incorrect_reading_answers: number;
    };
}

// Level Progressions types
export type WanikaniLevelProgressionsResponse = WanikaniCollectionResponse<WanikaniLevelProgression>;

export interface WanikaniLevelProgression {
    id: number;
    object: string;
    url: string;
    data_updated_at: string;
    data: {
        created_at: string;
        level: number;
        unlocked_at: string | null;
        started_at: string | null;
        passed_at: string | null;
        completed_at: string | null;
        abandoned_at: string | null;
    };
}

// Voice Actors types
export type WanikaniVoiceActorsResponse = WanikaniCollectionResponse<WanikaniVoiceActor>;

export interface WanikaniVoiceActor {
    id: number;
    object: string;
    url: string;
    data_updated_at: string;
    data: {
        created_at: string;
        name: string;
        description: string;
        gender: string;
        voice_actor_id: number;
        voice_actor_name: string;
        voice_description: string;
    };
}

// Resets types
export type WanikaniResetsResponse = WanikaniCollectionResponse<WanikaniReset>;

export interface WanikaniReset {
    id: number;
    object: string;
    url: string;
    data_updated_at: string;
    data: {
        created_at: string;
        original_level: number;
        target_level: number;
        confirmed_at: string | null;
    };
}
