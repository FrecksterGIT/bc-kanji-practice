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
      <h1 className="mb-4 text-3xl font-bold">Settings</h1>
      <div className="w-full max-w-md px-6">
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
                className="mt-1 block w-full rounded-l-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your API key"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="mt-1 rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="mb-4 text-lg font-medium">Marked Items</h3>
                <p className="mb-4 text-sm text-gray-600">Randomize the order of marked items.</p>
                <div className="grid grid-cols-2 justify-between gap-4">
                  <button
                    onClick={randomizeMarkedItems}
                    className="rounded-md bg-gradient-to-br from-pink-500 to-purple-500 px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    Randomize items
                  </button>
                  <button
                    onClick={() => setMarkedItems([])}
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
