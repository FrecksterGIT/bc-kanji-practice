import { WanikaniAssignment } from '../../types';

// Database name and version
const DB_NAME = 'wanikani-assignments';
const DB_VERSION = 2;

// Store name
const STORE_NAME = 'assignments';

// Interface for the database operations
export interface AssignmentDatabase {
  open(): Promise<void>;

  close(): void;

  add(assignment: WanikaniAssignment): Promise<number>;

  addMany(assignments: WanikaniAssignment[]): Promise<number[]>;

  get(id: number): Promise<WanikaniAssignment | undefined>;

  getAll(): Promise<WanikaniAssignment[]>;

  getByIds(ids: number[]): Promise<WanikaniAssignment[]>;

  getBySubjectIds(subjectIds: number[]): Promise<WanikaniAssignment[]>;

  delete(id: number): Promise<void>;

  clear(): Promise<void>;
}

/**
 * IndexedDB implementation for storing WanikaniAssignment objects.
 * Uses the id as the key and sets indexes on the "data.level", "data.subject_type",
 * "data.started_at", and "data.available_at" fields.
 */
export class AssignmentDB implements AssignmentDatabase {
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

        // Create the object store with id as the key path if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create index for 'data.subject_id'
          store.createIndex('subject_id', 'data.subject_id', { unique: false });
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
   * Adds an assignment to the database.
   * @param assignment The assignment to add.
   * @returns A promise that resolves with the id of the added assignment.
   */
  async add(assignment: WanikaniAssignment): Promise<number> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(assignment);

      request.onerror = (event) => {
        reject(new Error(`Failed to add assignment: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(assignment.id);
      };
    });
  }

  /**
   * Adds multiple assignments to the database.
   * @param assignments An array of assignments to add.
   * @returns A promise that resolves with an array of ids of the added assignments.
   */
  async addMany(assignments: WanikaniAssignment[]): Promise<number[]> {
    if (!this.db) {
      await this.open();
    }

    if (assignments.length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const ids: number[] = [];
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        if (completed === assignments.length && !hasError) {
          resolve(ids);
        }
      };

      assignments.forEach((assignment) => {
        const request = store.put(assignment);

        request.onerror = (event) => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`Failed to add assignment: ${(event.target as IDBRequest).error}`));
          }
        };

        request.onsuccess = () => {
          ids.push(assignment.id);
          completed++;
          checkComplete();
        };
      });
    });
  }

  /**
   * Gets an assignment by its id.
   * @param id The id of the assignment to get.
   * @returns A promise that resolves with the assignment or undefined if not found.
   */
  async get(id: number): Promise<WanikaniAssignment | undefined> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = (event) => {
        reject(new Error(`Failed to get assignment: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as WanikaniAssignment | undefined);
      };
    });
  }

  /**
   * Gets all assignments from the database.
   * @returns A promise that resolves with an array of all assignments.
   */
  async getAll(): Promise<WanikaniAssignment[]> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = (event) => {
        reject(new Error(`Failed to get all assignments: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve(request.result as WanikaniAssignment[]);
      };
    });
  }

  /**
   * Gets assignments by their ids.
   * @param ids An array of assignment ids to retrieve.
   * @returns A promise that resolves with an array of matching assignments.
   */
  async getByIds(ids: number[]): Promise<WanikaniAssignment[]> {
    if (!this.db) {
      await this.open();
    }

    if (ids.length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const assignments: WanikaniAssignment[] = [];
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        if (completed === ids.length && !hasError) {
          resolve(assignments);
        }
      };

      ids.forEach((id) => {
        const request = store.get(id);

        request.onerror = (event) => {
          if (!hasError) {
            hasError = true;
            reject(
              new Error(`Failed to get assignment by id: ${(event.target as IDBRequest).error}`)
            );
          }
        };

        request.onsuccess = () => {
          const assignment = request.result as WanikaniAssignment;
          if (assignment) {
            assignments.push(assignment);
          }
          completed++;
          checkComplete();
        };
      });
    });
  }

  /**
   * Gets assignments by their subject ids.
   * @param subjectIds An array of subject ids to retrieve assignments for.
   * @returns A promise that resolves with an array of matching assignments.
   */
  async getBySubjectIds(subjectIds: number[]): Promise<WanikaniAssignment[]> {
    if (!this.db) {
      await this.open();
    }

    if (subjectIds.length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('subject_id');
      const assignments: WanikaniAssignment[] = [];
      let completed = 0;
      let hasError = false;

      const checkComplete = () => {
        if (completed === subjectIds.length && !hasError) {
          resolve(assignments);
        }
      };

      subjectIds.forEach((subjectId) => {
        const request = index.getAll(subjectId);

        request.onerror = (event) => {
          if (!hasError) {
            hasError = true;
            reject(
              new Error(
                `Failed to get assignments by subject id: ${(event.target as IDBRequest).error}`
              )
            );
          }
        };

        request.onsuccess = () => {
          const subjectAssignments = request.result as WanikaniAssignment[];
          if (subjectAssignments && subjectAssignments.length > 0) {
            assignments.push(...subjectAssignments);
          }
          completed++;
          checkComplete();
        };
      });
    });
  }

  /**
   * Deletes an assignment by its id.
   * @param id The id of the assignment to delete.
   * @returns A promise that resolves when the assignment is deleted.
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
        reject(new Error(`Failed to delete assignment: ${(event.target as IDBRequest).error}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Clears all assignments from the database.
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
export const assignmentDB = new AssignmentDB();
