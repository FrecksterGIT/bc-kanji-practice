import { baseUrl, BasicDataType, resources, ResourceType } from "../contexts/WanikaniContext.ts";
import {
  addManyAssignments,
  addManySubjects,
  getAllAssignments,
  getAllSubjects,
} from "./itemDB.ts";
import { incrementLoadedCount, resetLoadedCount } from "./syncProgress.ts";
import { isAssignmentList, isSubjectList } from "./typeChecks.ts";
import { wkLoad } from "./wkLoad.ts";

const syncPromises = new Map<string, Promise<void>>();
const failedSyncKeys = new Set<string>();
const emptySyncPromise = Promise.resolve();

async function writeData<T extends BasicDataType = BasicDataType>(data: T[]): Promise<void> {
  if (!data || data.length === 0) {
    return;
  }
  if (isSubjectList(data)) {
    return addManySubjects(data);
  }
  if (isAssignmentList(data)) {
    return addManyAssignments(data);
  }
}

async function fetcher<T extends BasicDataType = BasicDataType>(
  apiKey: string,
  url: string,
  type: ResourceType,
): Promise<{ data: T[]; next_url?: string | null }> {
  if (!apiKey) {
    return Promise.resolve({ data: [], next_url: undefined });
  }

  incrementLoadedCount();
  if (type === ResourceType.subjects) {
    const data = await wkLoad.subjects({ url, apiKey });
    if (data.data.length > 0) {
      await writeData(data.data);
    }
    return { data: data.data as T[], next_url: data.pages?.next_url };
  } else if (type === ResourceType.assignments) {
    const data = await wkLoad.assignments({ url, apiKey });
    if (data.data.length > 0) {
      await writeData(data.data);
    }
    return { data: data.data as T[], next_url: data.pages?.next_url };
  }
  return { data: [] };
}

async function load<T extends BasicDataType = BasicDataType>(
  apiKey: string,
  type: ResourceType,
  latest: string | null,
) {
  const url = new URL(resources[type], baseUrl);
  if (latest) {
    url.searchParams.set("updated_after", latest);
  }
  // Incremental and full syncs both follow next_url: WaniKani pages at 500 items, and
  // next_url keeps the updated_after filter, so an incremental sync can span many pages.
  let next: string | null | undefined = url.toString();
  while (next) {
    const page: { next_url?: string | null } = await fetcher<T>(apiKey, next, type);
    next = page.next_url;
  }
}

const getLatest = (items: BasicDataType[]) =>
  items.reduce<string | null>((acc, item) => {
    const date = new Date(item.data_updated_at);
    if (!acc) return item.data_updated_at;
    if (date.getTime() > new Date(acc).getTime()) {
      return item.data_updated_at;
    }
    return acc;
  }, null);

const initializeLoading = async () => {
  const [subjects, assignments] = await Promise.all([getAllSubjects(), getAllAssignments()]);
  return [getLatest(subjects), getLatest(assignments)];
};

export const getSync = (apiKey: string): Promise<void> => {
  if (!apiKey) {
    return emptySyncPromise;
  }

  if (failedSyncKeys.has(apiKey)) {
    return emptySyncPromise;
  }

  const cachedSync = syncPromises.get(apiKey);
  if (cachedSync) {
    return cachedSync;
  }

  const syncPromise = (async () => {
    const [latestSubjects, latestAssignments] = await initializeLoading();
    // Reset after the first await: this runs outside render, so the mounted
    // LoadingScreen can subscribe-notify without a setState-in-render warning.
    resetLoadedCount();
    const results = await Promise.allSettled([
      load(apiKey, ResourceType.subjects, latestSubjects),
      load(apiKey, ResourceType.assignments, latestAssignments),
    ]);
    const failure = results.find((result) => result.status === "rejected");
    if (failure) {
      throw failure.reason;
    }
  })().catch((error) => {
    console.error("WaniKani sync failed", error);
    syncPromises.delete(apiKey);
    failedSyncKeys.add(apiKey);
  });

  syncPromises.set(apiKey, syncPromise);
  return syncPromise;
};
