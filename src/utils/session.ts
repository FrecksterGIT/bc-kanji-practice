import { PersistedSettings } from "../contexts/SessionContext.tsx";
import { WanikaniUserData } from "../wanikani";
import { clearSettings, getSettings } from "./itemDB.ts";
import { wkLoad } from "./wkLoad.ts";

let initialSettingsPromise: Promise<PersistedSettings | undefined> | undefined;
const userPromises = new Map<string, Promise<WanikaniUserData | null>>();
const emptyUserPromise = Promise.resolve(null);

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

export const getUser = (apiKey: string): Promise<WanikaniUserData | null> => {
  if (!apiKey) {
    return emptyUserPromise;
  }

  const cachedUser = userPromises.get(apiKey);
  if (cachedUser) {
    return cachedUser;
  }

  const userPromise = wkLoad
    .user({ url: "https://api.wanikani.com/v2/user", apiKey })
    .then(({ data }) => data)
    .catch(() => null);
  userPromises.set(apiKey, userPromise);
  return userPromise;
};
