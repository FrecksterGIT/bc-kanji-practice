import { DBSchema, openDB } from 'idb';
import { WanikaniAssignment, WanikaniSubject } from '../../types';

type ValidValue<T> = Exclude<T, null | undefined | 0 | '' | false>;
const BooleanFilter = <T>(x: T): x is ValidValue<T> => Boolean(x);

interface DB extends DBSchema {
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
}

async function getDB() {
  return openDB<DB>('db', 1, {
    upgrade(database, oldVersion, newVersion) {
      if (oldVersion !== newVersion && oldVersion !== 0) {
        database.deleteObjectStore('subjects');
        database.deleteObjectStore('assignments');
      }
      const subjectStore = database.createObjectStore('subjects', {
        keyPath: 'id',
        autoIncrement: false,
      });
      subjectStore.createIndex('level', 'data.level');

      database.createObjectStore('assignments', {
        keyPath: 'id',
      });
    },
  });
}

export async function addManySubjects(data: WanikaniSubject[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('subjects', 'readwrite');
  const store = tx.objectStore('subjects');

  for (const entry of data) {
    await store.put(entry);
  }
  await tx.done;
}

export async function addManyAssignments(data: WanikaniAssignment[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('assignments', 'readwrite');
  const store = tx.objectStore('assignments');

  for (const entry of data) {
    await store.put(entry);
  }
  await tx.done;
}

export async function getAllSubjects(): Promise<WanikaniSubject[]> {
  const db = await getDB();
  return db.getAll('subjects');
}

export async function getAllAssignments(): Promise<WanikaniAssignment[]> {
  const db = await getDB();
  return db.getAll('assignments');
}

export async function getSubjectByIds(ids: number[]): Promise<WanikaniSubject[]> {
  const db = await getDB();
  return await Promise.all(ids.map((id) => db.get('subjects', id))).then((d) =>
    d.filter(BooleanFilter)
  );
}

export async function getSubjectsByObjectAndLevel(
  objectType: string,
  level: number
): Promise<WanikaniSubject[]> {
  const db = await getDB();
  return db
    .getAllFromIndex('subjects', 'level', level)
    .then((items) => items.filter((item) => item.object === objectType));
}
