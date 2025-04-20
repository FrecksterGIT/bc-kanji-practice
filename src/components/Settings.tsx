import {useSettingsStore} from '../store/settingsStore';
import {ChangeEvent, type FC} from "react";

interface SettingsProps {
}

const Settings: FC<SettingsProps> = () => {
    // Get state and actions from the settings store
    const {
        apiKey,
        limitToLearned,
        limitToCurrentLevel,
        sortByNextReview,
        level,
        setApiKey,
        setLimitToLearned,
        setLimitToCurrentLevel,
        setSortByNextReview,
        setLevel
    } = useSettingsStore();

    // Handle input changes
    const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };

    const handleLevelChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newLevel = parseInt(e.target.value, 10);
        if (!isNaN(newLevel) && newLevel > 0) {
            setLevel(newLevel);
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
                        <input
                            type="text"
                            id="apiKey"
                            value={apiKey}
                            onChange={handleApiKeyChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Enter your API key"
                        />
                    </div>

                    {/* Level Input */}
                    <div className="space-y-2">
                        <label htmlFor="level" className="block text-sm font-medium">
                            Level
                        </label>
                        <input
                            type="number"
                            id="level"
                            value={level}
                            onChange={handleLevelChange}
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="Enter your level"
                        />
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
                </form>
            </div>
        </div>
    );
};

export default Settings;
