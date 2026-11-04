let loadedCount = 0;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const getLoadedCount = (): number => loadedCount;

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const incrementLoadedCount = (): void => {
  loadedCount += 1;
  notify();
};

export const resetLoadedCount = (): void => {
  loadedCount = 0;
  notify();
};
