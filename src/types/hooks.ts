// Hook return types

import { WanikaniUserData, WanikaniAssignment } from './wanikani';
import { KanjiItem, VocabularyItem } from './data';

// Define the return type for the useWanikaniUser hook
export interface UseWanikaniUserResult {
    user: WanikaniUserData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Define the return type for the useWanikaniAssignments hook
export interface UseWanikaniAssignmentsResult {
    assignments: WanikaniAssignment[] | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Define the return type for the useRelatedVocabulary hook
export interface UseRelatedVocabularyResult {
    relatedVocabulary: VocabularyItem[];
    loading: boolean;
    error: Error | null;
}

// Define the return type for the useDataFiles hook
export interface UseDataFilesResult<T extends KanjiItem | VocabularyItem> {
    data: T[] | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Define the shape of the user context
export interface UserContextType {
    user: WanikaniUserData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
    speak: (text: string) => void;
}
