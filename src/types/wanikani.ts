// WaniKani API related types

// User data types
export interface WanikaniUserResponse {
    object: string;
    url: string;
    data_updated_at: string;
    data: WanikaniUserData;
}

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
export interface WanikaniAssignmentsResponse {
    object: string;
    url: string;
    pages: {
        per_page: number;
        next_url: string | null;
        previous_url: string | null;
    };
    total_count: number;
    data_updated_at: string;
    data: WanikaniAssignment[];
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
