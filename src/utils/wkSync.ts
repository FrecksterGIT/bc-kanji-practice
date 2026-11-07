import { baseUrl, resources, ResourceType } from "../contexts/WanikaniContext.ts";
import { WanikaniUserData } from "../wanikani";
import {
  addManyAssignments,
  addManySubjects,
  clearAssignments,
  getSyncedAt,
  getSyncScope,
  setSyncedAt,
  setSyncScope,
} from "./itemDB.ts";
import { incrementLoadedCount, resetLoadedCount } from "./syncProgress.ts";
import { wkLoad } from "./wkLoad.ts";

export type SyncResult = { status: "ok" } | { status: "failed"; error: unknown };

/**
 * `updated_after` is the client's clock before the first request, minus this margin, so a
 * skewed clock or an item changed while the run was in flight is fetched again next time
 * rather than missed. Re-fetching is harmless because pages are written with `put`.
 */
const CLOCK_SKEW_MARGIN_MS = 5 * 60 * 1000;

/**
 * A resource synced less than this long ago is not requested again on page load. The stored
 * timestamp is up to CLOCK_SKEW_MARGIN_MS older than the real sync, so the next sync happens
 * slightly earlier than 12 hours after the last one.
 */
export const SYNC_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** True when a stored "last synced" timestamp is recent enough to skip the sync. */
export const isFresh = (syncedAt: string | null, now = Date.now()): boolean => {
  if (!syncedAt) {
    return false;
  }
  const age = now - Date.parse(syncedAt);
  // NaN (unparsable) and negative ages (a timestamp in the future, e.g. after the clock moved
  // back) both fail these comparisons and count as stale.
  return age >= 0 && age < SYNC_MAX_AGE_MS;
};

/** Identifies whose data the database holds: the account and its level cap. */
export const syncScopeFor = (user: WanikaniUserData): string =>
  `${user.id}:${user.subscription.max_level_granted}`;

const syncPromises = new Map<string, Promise<SyncResult>>();
const okSyncPromise = Promise.resolve<SyncResult>({ status: "ok" });

/** Fetches one page, stores it and returns the link to the next page. */
async function fetchPage(
  apiKey: string,
  url: string,
  type: ResourceType,
): Promise<string | null | undefined> {
  incrementLoadedCount();
  if (type === ResourceType.subjects) {
    const page = await wkLoad.subjects({ url, apiKey });
    if (page.data.length > 0) {
      await addManySubjects(page.data);
    }
    return page.pages?.next_url;
  }
  const page = await wkLoad.assignments({ url, apiKey });
  if (page.data.length > 0) {
    await addManyAssignments(page.data);
  }
  return page.pages?.next_url;
}

/**
 * Loads every page of a resource, changed since `since` when given. The "last synced"
 * timestamp is committed only after the last page is stored: a run that dies half-way leaves
 * the old timestamp (or none) in place, so the next run starts over instead of skipping the
 * pages it never got.
 */
async function syncResource(apiKey: string, type: ResourceType, since: string | null) {
  const startedAt = new Date(Date.now() - CLOCK_SKEW_MARGIN_MS).toISOString();
  const url = new URL(resources[type], baseUrl);
  if (since) {
    url.searchParams.set("updated_after", since);
  }
  // next_url keeps the updated_after filter, so incremental syncs can span many pages too.
  let next: string | null | undefined = url.toString();
  while (next) {
    next = await fetchPage(apiKey, next, type);
  }
  await setSyncedAt(type, startedAt);
}

/**
 * Assignments belong to one account. A full assignments sync starts from an empty store, so
 * rows left by another account, or by a run that died half-way, cannot show up as this one's.
 */
async function syncAssignments(apiKey: string, since: string | null) {
  if (!since) {
    await clearAssignments();
  }
  await syncResource(apiKey, ResourceType.assignments, since);
}

async function runSync(apiKey: string, scope: string): Promise<SyncResult> {
  try {
    const [storedScope, storedSubjectsSyncedAt, storedAssignmentsSyncedAt] = await Promise.all([
      getSyncScope(),
      getSyncedAt(ResourceType.subjects),
      getSyncedAt(ResourceType.assignments),
    ]);
    // Reset after the first await: this runs outside render, so the mounted
    // LoadingScreen can subscribe-notify without a setState-in-render warning.
    resetLoadedCount();

    // Timestamps from another account or subscription say nothing about this one: its
    // assignments differ, and a higher level cap means subjects that were never fetched.
    const scopeChanged = storedScope !== scope;
    const subjectsSince = scopeChanged ? null : storedSubjectsSyncedAt;
    const assignmentsSince = scopeChanged ? null : storedAssignmentsSyncedAt;

    // Each resource is skipped on its own when it was synced recently.
    const syncs: Promise<void>[] = [];
    if (!isFresh(subjectsSince)) {
      syncs.push(syncResource(apiKey, ResourceType.subjects, subjectsSince));
    }
    if (!isFresh(assignmentsSince)) {
      syncs.push(syncAssignments(apiKey, assignmentsSince));
    }
    const results = await Promise.allSettled(syncs);
    const failure = results.find((result) => result.status === "rejected");
    if (failure) {
      throw failure.reason;
    }
    // Only a run that finished both resources records the new scope. If it failed, the old
    // scope stays and the next load repeats the full sync.
    if (scopeChanged) {
      await setSyncScope(scope);
    }
    return { status: "ok" };
  } catch (error) {
    console.error("WaniKani sync failed", error);
    return { status: "failed", error };
  }
}

/**
 * Syncs WaniKani data for an API key once per page session. The outcome, including a failure,
 * is cached so re-renders don't re-request; call retrySync() to run it again.
 *
 * `scope` identifies the account behind the key (see syncScopeFor). Resources synced less than
 * SYNC_MAX_AGE_MS ago are skipped; a changed scope forces a full sync of both resources.
 */
export const getSync = (apiKey: string, scope: string): Promise<SyncResult> => {
  if (!apiKey) {
    return okSyncPromise;
  }

  const cached = syncPromises.get(apiKey);
  if (cached) {
    return cached;
  }

  const syncPromise = runSync(apiKey, scope);
  syncPromises.set(apiKey, syncPromise);
  return syncPromise;
};

/** Forgets the cached outcome for a key so the next getSync() syncs again. */
export const retrySync = (apiKey: string): void => {
  syncPromises.delete(apiKey);
};
