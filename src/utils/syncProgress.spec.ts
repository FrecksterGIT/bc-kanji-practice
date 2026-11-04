import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  getLoadedCount,
  incrementLoadedCount,
  resetLoadedCount,
  subscribe,
} from "./syncProgress.ts";

describe("syncProgress", () => {
  beforeEach(() => {
    resetLoadedCount();
  });

  it("should increment the loaded count", () => {
    incrementLoadedCount();

    expect(getLoadedCount()).toBe(1);
  });

  it("should reset the loaded count", () => {
    incrementLoadedCount();
    resetLoadedCount();

    expect(getLoadedCount()).toBe(0);
  });

  it("should notify subscribers on increment and reset", () => {
    const listener = vi.fn<() => void>();
    subscribe(listener);

    incrementLoadedCount();
    resetLoadedCount();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should stop notifying after unsubscribe", () => {
    const listener = vi.fn<() => void>();
    const unsubscribe = subscribe(listener);

    unsubscribe();
    incrementLoadedCount();

    expect(listener).not.toHaveBeenCalled();
  });
});
