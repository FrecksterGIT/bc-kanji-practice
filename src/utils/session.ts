import { PersistedSettings } from "../contexts/SessionContext.tsx";
import { WanikaniUserData } from "../wanikani";
import { clearSettings, getSettings } from "./itemDB.ts";
import { WanikaniHttpError, wkLoad } from "./wkLoad.ts";

export type ConnectionResult =
  | { status: "no-key" }
  | { status: "ok"; user: WanikaniUserData }
  | { status: "invalid-key" }
  | { status: "unreachable"; error: unknown };

let initialSettingsPromise: Promise<PersistedSettings | undefined> | undefined;
const userPromises = new Map<string, Promise<ConnectionResult>>();
const noKeyPromise = Promise.resolve<ConnectionResult>({ status: "no-key" });

export const getInitialSettings = (): Promise<PersistedSettings | undefined> => {
  initialSettingsPromise ??= getSettings().catch(async (error) => {
    console.error("Could not read saved settings; starting fresh", error);
    try {
      await clearSettings();
    } catch (clearError) {
      console.error("Could not clear saved settings", clearError);
    }
    return undefined;
  });
  return initialSettingsPromise;
};

const isAuthFailure = (error: unknown) =>
  error instanceof WanikaniHttpError && (error.status === 401 || error.status === 403);

const lookupUser = async (apiKey: string): Promise<ConnectionResult> => {
  try {
    const { data } = await wkLoad.user({ url: "https://api.wanikani.com/v2/user", apiKey });
    return { status: "ok", user: data };
  } catch (error) {
    if (isAuthFailure(error)) {
      return { status: "invalid-key" };
    }
    console.error("Could not reach WaniKani", error);
    return { status: "unreachable", error };
  }
};

/**
 * Resolves the account behind an API key. Every outcome is cached for the key, so a
 * failure is not re-requested on each render; call retryUser() to ask again.
 */
export const getUser = (apiKey: string): Promise<ConnectionResult> => {
  if (!apiKey) {
    return noKeyPromise;
  }

  const cached = userPromises.get(apiKey);
  if (cached) {
    return cached;
  }

  const userPromise = lookupUser(apiKey);
  userPromises.set(apiKey, userPromise);
  return userPromise;
};

/** Forgets the cached lookup for a key so the next getUser() asks WaniKani again. */
export const retryUser = (apiKey: string): void => {
  userPromises.delete(apiKey);
};
