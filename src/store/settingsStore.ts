import {create} from 'zustand'
import {persist} from 'zustand/middleware'

// Define the type for our settings state
interface SettingsState {
    apiKey: string
    limitToLearned: boolean
    limitToCurrentLevel: boolean
    sortByNextReview: boolean
    level: number
    setApiKey: (apiKey: string) => void
    setLimitToLearned: (limit: boolean) => void
    setLimitToCurrentLevel: (limit: boolean) => void
    setSortByNextReview: (sort: boolean) => void
    setLevel: (level: number) => void
}

// Create the store with persistence
export const useSettingsStore = create(
    persist<SettingsState>(
        (set) => ({
            // Initial state
            apiKey: '',
            limitToLearned: false,
            limitToCurrentLevel: false,
            sortByNextReview: false,
            level: 1,

            // Actions to update the state
            setApiKey: (apiKey) => set({apiKey}),
            setLimitToLearned: (limitToLearned) => set({limitToLearned}),
            setLimitToCurrentLevel: (limitToCurrentLevel) => set({limitToCurrentLevel}),
            setSortByNextReview: (sortByNextReview) => set({sortByNextReview}),
            setLevel: (level) => set({level}),
        }),
        {
            name: 'settings-storage', // name of the item in the storage (must be unique)
            // Storage can be localStorage or sessionStorage or custom
            // Using localStorage by default
        }
    )
)
