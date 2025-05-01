import { WanikaniSubject } from '../../types';

// Database name and version
const DB_NAME = 'wanikani-subjects';
const DB_VERSION = 1;

// Store name
const STORE_NAME = 'subjects';

// Interface for the database operations
export interface SubjectDatabase {
  open(): Promise<void>;

  close(): void;

  add(subject: WanikaniSubject): Promise<number>;

  addMany(subjects: WanikaniSubject[]): Promise<number[]>;

  get(id: number): Promise<WanikaniSubject | undefined>;

  getAll(): Promise<WanikaniSubject[]>;

  getByIds(ids: number[]): Promise<WanikaniSubject[]>;

  getByObject(objectType: string): Promise<WanikaniSubject[]>;

  getByLevel(level: number): Promise<WanikaniSubject[]>;

  getByObjectAndLevel(objectType: string, level: number): Promise<WanikaniSubject[]>;

  delete(id: number): Promise<void>;

  clear(): Promise<void>;
}

/**
 * IndexedDB implementation for storing WanikaniSubject objects.
 * Uses the id as the key and sets indexes on the "object" and "data.level" fields.
 */
export class SubjectDB implements SubjectDatabase {
  private db: IDBDatabase | null = null;

  /**
   * Opens the database connection and creates the object store if it doesn't exist.
   * @returns A promise that resolves when the database is open.
   */
  async open(): Promise<void> {
    if (this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        reject(new Error(`Failed to open database: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create the object store with id as the key path
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create indexes for 'object' and 'data.level'
          store.createIndex('object', 'object', { unique: false });
          store.createIndex('level', 'data.level', { unique: false });
        }
      };
    });
  }

  /**
   * Closes the database connection.
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Adds a subject to the database.
   * @param subject The subject to add.
   * @returns A promise that resolves with the id of the added subject.
   */
  async add(subject: WanikaniSubject): Promise<number> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(subject);

      request.onerror = (event) => {
        reject(new Error(`Failed to add subject: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(subject.id);
      };
    });
  }

  /**
   * Adds multiple subjects to the database.
   * @param subjects An array of subjects to add.
   * @returns A promise that resolves with an array of ids of the added subjects.
   */
  async addMany(subjects: WanikaniSubject[]): Promise<number[]> {
    if (!this.db) {
      await this.open();
    }

    if (subjects.length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const ids: number[] = [];
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        if (completed === subjects.length && !hasError) {
          resolve(ids);
        }
      };

      subjects.forEach((subject) => {
        const request = store.put(subject);

        request.onerror = (event) => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`Failed to add subject: ${(event.target as IDBRequest).error}`));
          }
        };

        request.onsuccess = () => {
          ids.push(subject.id);
          completed++;
          checkComplete();
        };
      });
    });
  }

  /**
   * Gets a subject by its id.
   * @param id The id of the subject to get.
   * @returns A promise that resolves with the subject or undefined if not found.
   */
  async get(id: number): Promise<WanikaniSubject | undefined> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = (event) => {
        reject(new Error(`Failed to get subject: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as WanikaniSubject | undefined);
      };
    });
  }

  /**
   * Gets all subjects from the database.
   * @returns A promise that resolves with an array of all subjects.
   */
  async getAll(): Promise<WanikaniSubject[]> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = (event) => {
        reject(new Error(`Failed to get all subjects: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as WanikaniSubject[]);
      };
    });
  }

  /**
   * Gets subjects by their object type.
   * @param objectType The object type to filter by.
   * @returns A promise that resolves with an array of matching subjects.
   */
  async getByObject(objectType: string): Promise<WanikaniSubject[]> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('object');
      const request = index.getAll(objectType);

      request.onerror = (event) => {
        reject(
          new Error(`Failed to get subjects by object: ${(event.target as IDBRequest).error}`)
        );
      };

      request.onsuccess = () => {
        resolve(request.result as WanikaniSubject[]);
      };
    });
  }

  /**
   * Gets subjects by their level.
   * @param level The level to filter by.
   * @returns A promise that resolves with an array of matching subjects.
   */
  async getByLevel(level: number): Promise<WanikaniSubject[]> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('level');
      const request = index.getAll(level);

      request.onerror = (event) => {
        reject(new Error(`Failed to get subjects by level: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as WanikaniSubject[]);
      };
    });
  }

  /**
   * Deletes a subject by its id.
   * @param id The id of the subject to delete.
   * @returns A promise that resolves when the subject is deleted.
   */
  async delete(id: number): Promise<void> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = (event) => {
        reject(new Error(`Failed to delete subject: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Gets subjects by both their object type and level.
   * @param objectType The object type to filter by.
   * @param level The level to filter by.
   * @returns A promise that resolves with an array of matching subjects.
   */
  async getByObjectAndLevel(objectType: string, level: number): Promise<WanikaniSubject[]> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('object');
      const request = index.getAll(objectType);

      request.onerror = (event) => {
        reject(
          new Error(
            `Failed to get subjects by object and level: ${(event.target as IDBRequest).error}`
          )
        );
      };

      request.onsuccess = () => {
        // Filter the results by level
        const subjects = request.result as WanikaniSubject[];
        const filteredSubjects = subjects.filter((subject) => subject.data.level === level);
        resolve(filteredSubjects);
      };
    });
  }

  /**
   * Gets subjects by their ids.
   * @param ids An array of subject ids to retrieve.
   * @returns A promise that resolves with an array of matching subjects.
   */
  async getByIds(ids: number[]): Promise<WanikaniSubject[]> {
    if (!this.db) {
      await this.open();
    }

    if (ids.length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const subjects: WanikaniSubject[] = [];
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        if (completed === ids.length && !hasError) {
          resolve(subjects);
        }
      };

      ids.forEach((id) => {
        const request = store.get(id);

        request.onerror = (event) => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`Failed to get subject by id: ${(event.target as IDBRequest).error}`));
          }
        };

        request.onsuccess = () => {
          const subject = request.result as WanikaniSubject;
          if (subject) {
            subjects.push(subject);
          }
          completed++;
          checkComplete();
        };
      });
    });
  }

  /**
   * Clears all subjects from the database.
   * @returns A promise that resolves when the database is cleared.
   */
  async clear(): Promise<void> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = (event) => {
        reject(new Error(`Failed to clear database: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}

// Export a singleton instance
export const subjectDB = new SubjectDB();
