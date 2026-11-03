import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { PersistedSettings, SortSetting } from "../contexts/SessionContext.tsx";

const getSettingsMock = vi.fn<() => Promise<PersistedSettings | undefined>>();
const clearSettingsMock = vi.fn<() => Promise<void>>();

vi.mock("./itemDB.ts", () => ({
  clearSettings: clearSettingsMock,
  getSettings: getSettingsMock,
}));

describe("session", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    getSettingsMock.mockReset();
    clearSettingsMock.mockReset();
  });

  it("should resolve saved settings without clearing storage", async () => {
    const settings: PersistedSettings = {
      apiKey: "secret",
      limitToLearned: true,
      limitToCurrentLevel: false,
      sorting: SortSetting.nextReview,
      level: 12,
      markedItems: [1, 2, 3],
    };
    getSettingsMock.mockResolvedValue(settings);

    const { getInitialSettings } = await import("./session.ts");

    await expect(getInitialSettings()).resolves.toBe(settings);
    expect(clearSettingsMock).not.toHaveBeenCalled();
  });

  it("should resolve undefined without clearing storage when no settings are saved", async () => {
    getSettingsMock.mockResolvedValue(undefined);

    const { getInitialSettings } = await import("./session.ts");

    await expect(getInitialSettings()).resolves.toBeUndefined();
    expect(clearSettingsMock).not.toHaveBeenCalled();
  });

  it("should clear storage and resolve undefined when saved settings cannot be read", async () => {
    const error = new Error("read failed");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    getSettingsMock.mockRejectedValue(error);
    clearSettingsMock.mockResolvedValue(undefined);

    const { getInitialSettings } = await import("./session.ts");

    await expect(getInitialSettings()).resolves.toBeUndefined();
    expect(clearSettingsMock).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Could not read saved settings; starting fresh",
      error,
    );
  });

  it("should resolve undefined when reading and clearing saved settings both fail", async () => {
    const readError = new Error("read failed");
    const clearError = new Error("clear failed");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    getSettingsMock.mockRejectedValue(readError);
    clearSettingsMock.mockRejectedValue(clearError);

    const { getInitialSettings } = await import("./session.ts");

    await expect(getInitialSettings()).resolves.toBeUndefined();
    expect(clearSettingsMock).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      "Could not read saved settings; starting fresh",
      readError,
    );
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      "Could not clear saved settings",
      clearError,
    );
  });
});
