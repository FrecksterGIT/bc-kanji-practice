import { type FC, useRef } from 'react';
import { useSession } from '../../hooks/useSession.ts';
import { SortSetting } from '../../contexts/SessionContext.tsx';

export const Settings: FC = () => {
  const {
    apiKey,
    limitToLearned,
    limitToCurrentLevel,
    sorting,
    updateSettings,
    setMarkedItems,
    isLoggedIn,
  } = useSession();
  const apiKeyRef = useRef<HTMLInputElement>(null);

  const handleSaveApiKey = () => {
    if (apiKeyRef.current) {
      updateSettings('apiKey', apiKeyRef.current.value);
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      <h1 className="mb-4 text-3xl font-bold">Settings</h1>
      <div className="w-full max-w-md px-6">
        <p className="mb-4">
          Configure your application preferences here.
          <br /> You need to set a valid WaniKani Api key for the application to work.
        </p>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* API Key Input */}
          <div className="mt-6 border-t border-gray-600 pt-6">
            <label htmlFor="apiKey" className="mb-4 block text-lg font-medium">
              API Key
            </label>
            <div className="flex">
              <input
                type="text"
                id="apiKey"
                defaultValue={apiKey}
                className="mt-1 block w-full rounded-l-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your API key"
                ref={apiKeyRef}
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
              <div className="mt-6 border-t border-gray-600 pt-6">
                <h3 className="mb-4 text-lg font-medium">Sorting</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="limitToLearned"
                      checked={limitToLearned}
                      onChange={(e) => updateSettings('limitToLearned', e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="limitToLearned">Limit content to currently learned</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="limitToCurrentLevel"
                      checked={limitToCurrentLevel}
                      onChange={(e) => updateSettings('limitToCurrentLevel', e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="limitToCurrentLevel">
                      Limit shown vocabulary to current level
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-600 pt-6">
                <h3 className="mb-4 text-lg font-medium">Sorting</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="sorting"
                      checked={sorting == SortSetting.id}
                      onChange={(e) => {
                        if (e.target.checked) updateSettings('sorting', SortSetting.id);
                      }}
                      className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="sorting">by WaniKani id</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="nextReview"
                      checked={sorting == SortSetting.nextReview}
                      onChange={(e) => {
                        if (e.target.checked) updateSettings('sorting', SortSetting.nextReview);
                      }}
                      className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="nextReview">by next review date</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="randomize"
                      checked={sorting == SortSetting.randomize}
                      onChange={(e) => {
                        if (e.target.checked) updateSettings('sorting', SortSetting.randomize);
                      }}
                      className="mr-2 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="randomize">random order each time</label>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-600 pt-6">
                <h3 className="mb-4 text-lg font-medium">Marked Items</h3>
                <p className="mb-4 text-sm text-gray-600">Remove all your marked items.</p>
                <button
                  onClick={() => setMarkedItems([])}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  Clear marked items
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
