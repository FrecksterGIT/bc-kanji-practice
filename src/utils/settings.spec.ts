import { describe, expect, it } from "vite-plus/test";
import { SortSetting } from "../contexts/SessionContext.tsx";
import { WanikaniUserData } from "../wanikani";
import { clampLevel, DEFAULT_SETTINGS, maxLevelFor, mergeSettings } from "./settings.ts";

const userWithMaxLevel = (max_level_granted: number) =>
  ({
    level: 50,
    subscription: { max_level_granted },
  }) as unknown as WanikaniUserData;

describe("mergeSettings", () => {
  it("returns defaults when nothing is stored", () => {
    expect(mergeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it("fills fields missing from an older save", () => {
    const older = { apiKey: "k", level: 7, markedItems: [3] } as unknown as Parameters<
      typeof mergeSettings
    >[0];
    const merged = mergeSettings(older);
    expect(merged.apiKey).toBe("k");
    expect(merged.level).toBe(7);
    expect(merged.markedItems).toEqual([3]);
    expect(merged.sorting).toBe(SortSetting.id);
    expect(merged.limitToLearned).toBe(false);
  });
});

describe("maxLevelFor", () => {
  it("uses the subscription cap, not the user's level", () => {
    expect(maxLevelFor(userWithMaxLevel(3))).toBe(3);
    expect(maxLevelFor(userWithMaxLevel(60))).toBe(60);
  });

  it("falls back to 3 when logged out", () => {
    expect(maxLevelFor(null)).toBe(3);
  });
});

describe("clampLevel", () => {
  it("keeps a level inside the allowed range", () => {
    expect(clampLevel(2, 60)).toBe(2);
  });

  it("clamps a persisted level above the cap down to the cap", () => {
    expect(clampLevel(20, 3)).toBe(3);
  });

  it("never goes below level 1", () => {
    expect(clampLevel(0, 3)).toBe(1);
  });
});
