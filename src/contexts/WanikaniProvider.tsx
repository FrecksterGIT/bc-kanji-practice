import { FC, Fragment, PropsWithChildren, use, useCallback, useReducer } from "react";
import { useSession } from "../hooks/useSession.ts";
import { getSync, retrySync, syncScopeFor } from "../utils/wkSync.ts";

export const WanikaniProvider: FC<PropsWithChildren> = ({ children }) => {
  const { apiKey, user } = useSession();
  const [retryCount, bumpRetry] = useReducer((count: number) => count + 1, 0);
  const retry = useCallback(() => {
    retrySync(apiKey);
    bumpRetry();
  }, [apiKey]);

  const result = user ? use(getSync(apiKey, syncScopeFor(user))) : null;

  return (
    <>
      {result?.status === "failed" && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-red-900 px-4 py-2 text-sm text-red-100"
        >
          <span>
            Updating data from WaniKani failed. You may be seeing outdated or incomplete data.
          </span>
          <button
            type="button"
            onClick={retry}
            className="cursor-pointer underline hover:text-white focus:outline-none"
          >
            Try again
          </button>
        </div>
      )}
      {/* Remount after a retry so item hooks re-read the freshly synced IndexedDB data. */}
      <Fragment key={retryCount}>{children}</Fragment>
    </>
  );
};
