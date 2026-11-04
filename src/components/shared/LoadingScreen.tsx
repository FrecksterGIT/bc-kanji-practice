import { FC, useSyncExternalStore } from "react";
import { getLoadedCount, subscribe } from "../../utils/syncProgress.ts";

export const LoadingScreen: FC = () => {
  const loadedCount = useSyncExternalStore(subscribe, getLoadedCount);

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-gray-400">
      <div className="container mx-auto flex grow items-center justify-center">
        <div className="text-xl">Updating data... ({loadedCount} resources loaded)</div>
      </div>
    </div>
  );
};
