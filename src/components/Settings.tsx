import {useSettingsStore} from '../store/settingsStore';
import {ChangeEvent, type FC, useState, useEffect} from "react";
import {clearAllDataFileCaches} from '../utils/dataLoader';

interface SettingsProps {
}

const Settings: FC<SettingsProps> = () => {
    // Get state and actions from the settings store
    const {
        apiKey,
        limitToLearned,
        limitToCurrentLevel,
        sortByNextReview,
        setApiKey,
        setLimitToLearned,
        setLimitToCurrentLevel,
        setSortByNextReview,
    } = useSettingsStore();

    // Local state for API key input
    const [apiKeyInput, setApiKeyInput] = useState(apiKey);

    // Synchronize local state with store value when apiKey changes
    useEffect(() => {
        setApiKeyInput(apiKey);
    }, [apiKey]);

    // State for cache clearing feedback
    const [cacheCleared, setCacheCleared] = useState(false);

    // Handle input changes
    const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
        setApiKeyInput(e.target.value);
    };

    // Handle save API key
    const handleSaveApiKey = () => {
        setApiKey(apiKeyInput);
    };

    // Handle cache clearing
    const handleClearCache = async () => {
        try {
            await clearAllDataFileCaches();
            setCacheCleared(true);

            // Reset the message after 3 seconds
            setTimeout(() => {
                setCacheCleared(false);
            }, 3000);
        } catch (error) {
            console.error('Error clearing cache:', error);
            // Optionally, you could add error handling UI here
        }
    };

    return (
        <div className="flex flex-col items-center py-8">
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <div className="p-6 rounded-lg shadow-md max-w-md w-full">
                <p className="mb-4">
                    Configure your application preferences here.
                </p>
                <form className="space-y-6">
                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label htmlFor="apiKey" className="block text-sm font-medium">
                            API Key
                        </label>
                        <div className="flex">
                            <input
                                type="text"
                                id="apiKey"
                                value={apiKeyInput}
                                onChange={handleApiKeyChange}
                                className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                placeholder="Enter your API key"
                            />
                            <button
                                type="button"
                                onClick={handleSaveApiKey}
                                className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="limitToLearned"
                                checked={limitToLearned}
                                onChange={(e) => setLimitToLearned(e.target.checked)}
                                className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="limitToLearned">
                                Limit content to currently learned
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="limitToCurrentLevel"
                                checked={limitToCurrentLevel}
                                onChange={(e) => setLimitToCurrentLevel(e.target.checked)}
                                className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="limitToCurrentLevel">
                                Limit shown vocabulary to current level
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="sortByNextReview"
                                checked={sortByNextReview}
                                onChange={(e) => setSortByNextReview(e.target.checked)}
                                className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="sortByNextReview">
                                Sort items by next review date
                            </label>
                        </div>
                    </div>

                    {/* Cache Management Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium mb-4">Data Cache Management</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Clear all cached data files to fetch fresh data on next access.
                        </p>
                        <button
                            onClick={handleClearCache}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Clear Data Cache
                        </button>

                        {cacheCleared && (
                            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md">
                                Cache cleared successfully!
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
