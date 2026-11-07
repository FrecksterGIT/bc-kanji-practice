import { DBSchema, openDB } from "idb";
import { WanikaniAssignment, WanikaniSubject } from "../wanikani";
import { PersistedSettings } from "../contexts/SessionContext.tsx";

type ValidValue<T> = Exclude<T, null | undefined | 0 | "" | false>;
const BooleanFilter = <T>(x: T): x is ValidValue<T> => Boolean(x);

interface ItemDB extends DBSchema {
  subjects: {
    value: WanikaniSubject;
    key: number;
    indexes: {
      level: number;
    };
  };
  assignments: {
    value: WanikaniAssignment;
    key: number;
  };
  settings: {
    value: PersistedSettings & {
      key: string;
    };
    key: string;
  };
  meta: {
    value: { key: string; value: string };
    key: string;
  };
}

async function getDB() {
  return openDB<ItemDB>("db", 2, {
    upgrade(database, oldVersion) {
      // Each version adds its own `if (oldVersion < n)` block and must never drop "settings",
      // which holds the API key and marked items.
      if (oldVersion < 1) {
        const subjectStore = database.createObjectStore("subjects", {
          keyPath: "id",
          autoIncrement: false,
        });
        subjectStore.createIndex("level", "data.level");

        database.createObjectStore("assignments", {
          keyPath: "id",
          autoIncrement: false,
        });

        database.createObjectStore("settings", {
          keyPath: "key",
          autoIncrement: false,
        });
      }
      // Version 2: records when each resource was last synced completely. Without an entry the
      // next sync is a full one, which also re-fetches data that an older, truncated incremental
      // sync may have missed.
      if (oldVersion < 2) {
        database.createObjectStore("meta", {
          keyPath: "key",
          autoIncrement: false,
        });
      }
    },
  });
}

export async function addManySubjects(data: WanikaniSubject[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("subjects", "readwrite");
  const store = tx.objectStore("subjects");

  for (const entry of data) {
    await store.put(entry);
  }
  await tx.done;
}

export async function addManyAssignments(data: WanikaniAssignment[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("assignments", "readwrite");
  const store = tx.objectStore("assignments");

  for (const entry of data) {
    await store.put(entry);
  }
  await tx.done;
}

export async function getAllAssignments(): Promise<WanikaniAssignment[]> {
  const db = await getDB();
  return db.getAll("assignments");
}

export async function getSubjectByIds(ids: number[]): Promise<WanikaniSubject[]> {
  const db = await getDB();
  return await Promise.all(ids.map((id) => db.get("subjects", id))).then((d) =>
    d.filter(BooleanFilter),
  );
}

export async function getSubjectsByObjectAndLevel(
  objectType: string,
  level: number,
): Promise<WanikaniSubject[]> {
  const db = await getDB();
  return db
    .getAllFromIndex("subjects", "level", level)
    .then((items) => items.filter((item) => item.object === objectType));
}

const syncedAtKey = (resource: string) => `syncedAt:${resource}`;
const SYNC_SCOPE_KEY = "syncScope";

async function getMeta(key: string): Promise<string | null> {
  const db = await getDB();
  return (await db.get("meta", key))?.value ?? null;
}

async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.put("meta", { key, value });
}

/** When this resource last finished a complete sync, or null if it never did. */
export const getSyncedAt = (resource: string): Promise<string | null> =>
  getMeta(syncedAtKey(resource));

export const setSyncedAt = (resource: string, timestamp: string): Promise<void> =>
  setMeta(syncedAtKey(resource), timestamp);

/** The account and subscription the stored data was synced for, or null if never synced. */
export const getSyncScope = (): Promise<string | null> => getMeta(SYNC_SCOPE_KEY);

export const setSyncScope = (scope: string): Promise<void> => setMeta(SYNC_SCOPE_KEY, scope);

/**
 * Empties the assignments store and forgets when it was synced, in one transaction. Assignments
 * belong to one account, so this runs before a full assignments sync; dropping the timestamp
 * with the rows means a run that dies half-way can never leave rows that look up to date.
 */
export async function clearAssignments(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["assignments", "meta"], "readwrite");
  await Promise.all([
    tx.objectStore("assignments").clear(),
    tx.objectStore("meta").delete(syncedAtKey("assignments")),
  ]);
  await tx.done;
}

export async function getSettings(): Promise<ItemDB["settings"]["value"] | undefined> {
  const db = await getDB();
  return db.get("settings", "settings");
}

export async function clearSettings(): Promise<void> {
  const db = await getDB();
  await db.delete("settings", "settings");
}

/** Removes everything stored in this browser: cached WaniKani data, settings and marks. */
export async function clearLocalData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["subjects", "assignments", "settings", "meta"], "readwrite");
  await Promise.all([
    tx.objectStore("subjects").clear(),
    tx.objectStore("assignments").clear(),
    tx.objectStore("settings").clear(),
    tx.objectStore("meta").clear(),
  ]);
  await tx.done;
}

export async function saveSettings(settings: PersistedSettings): Promise<void> {
  const db = await getDB();
  await db.put("settings", { ...settings, key: "settings" });
}
