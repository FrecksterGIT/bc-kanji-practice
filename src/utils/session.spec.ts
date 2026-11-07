import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { PersistedSettings, SortSetting } from "../contexts/SessionContext.tsx";

const getSettingsMock = vi.fn<() => Promise<PersistedSettings | undefined>>();
const clearSettingsMock = vi.fn<() => Promise<void>>();
const userRequestMock = vi.fn<(request: { url: string; apiKey: string }) => Promise<unknown>>();
const getSyncedAtMock = vi.fn<(resource: string) => Promise<string | null>>();
const getSyncScopeMock = vi.fn<() => Promise<string | null>>();

vi.mock("./itemDB.ts", () => ({
  clearSettings: clearSettingsMock,
  getSettings: getSettingsMock,
  getSyncedAt: getSyncedAtMock,
  getSyncScope: getSyncScopeMock,
}));

vi.mock("./wkLoad.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./wkLoad.ts")>()),
  wkLoad: { user: userRequestMock },
}));

const USER = { id: "user-1", username: "tester", subscription: { max_level_granted: 60 } };

describe("session", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    getSettingsMock.mockReset();
    clearSettingsMock.mockReset();
    userRequestMock.mockReset();
    getSyncedAtMock.mockReset();
    getSyncScopeMock.mockReset();
  });

  it("asks WaniKani for the user on every page load, even when the data is recently synced", async () => {
    // A fresh sync record must not stand in for the user lookup.
    getSyncedAtMock.mockResolvedValue(new Date().toISOString());
    getSyncScopeMock.mockResolvedValue("user-1:60");
    userRequestMock.mockResolvedValue({ data: USER });

    const { getUser } = await import("./session.ts");

    await expect(getUser("key")).resolves.toEqual({ status: "ok", user: USER });
    expect(userRequestMock).toHaveBeenCalledTimes(1);
  });

  it("asks WaniKani only once per key within a page session", async () => {
    userRequestMock.mockResolvedValue({ data: USER });

    const { getUser } = await import("./session.ts");

    await getUser("key");
    await getUser("key");
    expect(userRequestMock).toHaveBeenCalledTimes(1);

    await getUser("other-key");
    expect(userRequestMock).toHaveBeenCalledTimes(2);
  });

  it("asks WaniKani again after a page reload", async () => {
    userRequestMock.mockResolvedValue({ data: USER });

    const first = await import("./session.ts");
    await first.getUser("key");

    vi.resetModules();
    const reloaded = await import("./session.ts");
    await reloaded.getUser("key");

    expect(userRequestMock).toHaveBeenCalledTimes(2);
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
