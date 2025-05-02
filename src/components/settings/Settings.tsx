import { useSettingsStore } from '../../store/settingsStore.ts';
import { ChangeEvent, type FC, useState, useEffect } from 'react';
import useMarkedItems from '../../hooks/useMarkedItems.ts';
import useSession from '../../hooks/useSession.ts';

const Settings: FC = () => {
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
  const { isLoggedIn } = useSession();
  const { randomizeMarkedItems, setMarkedItems } = useMarkedItems();

  const [apiKeyInput, setApiKeyInput] = useState(apiKey);

  useEffect(() => {
    setApiKeyInput(apiKey);
  }, [apiKey]);

  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiKeyInput(e.target.value);
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
  };

  return (
    <div className="flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="px-6 max-w-md w-full">
        <p className="mb-4">Configure your application preferences here.</p>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
                className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
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
          {isLoggedIn && (
            <>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="limitToLearned"
                    checked={limitToLearned}
                    onChange={(e) => setLimitToLearned(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="limitToLearned">Limit content to currently learned</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sortByNextReview"
                    checked={sortByNextReview}
                    onChange={(e) => setSortByNextReview(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="sortByNextReview">Sort items by next review date</label>
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
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Marked Items</h3>
                <p className="text-sm text-gray-600 mb-4">Randomize the order of marked items.</p>
                <div className="grid grid-cols-2 gap-4 justify-between">
                  <button
                    onClick={randomizeMarkedItems}
                    className="px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Randomize items
                  </button>
                  <button
                    onClick={() => setMarkedItems([])}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Clear marked items
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
