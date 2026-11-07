import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  subjects: vi.fn<(request: { url: string; apiKey: string }) => Promise<unknown>>(),
  assignments: vi.fn<(request: { url: string; apiKey: string }) => Promise<unknown>>(),
  getSyncedAt: vi.fn<(resource: string) => Promise<string | null>>(),
  setSyncedAt: vi.fn<(resource: string, timestamp: string) => Promise<void>>(),
  getSyncScope: vi.fn<() => Promise<string | null>>(),
  setSyncScope: vi.fn<(scope: string) => Promise<void>>(),
  clearAssignments: vi.fn<() => Promise<void>>(),
  addManySubjects: vi.fn<(data: unknown[]) => Promise<void>>(),
  addManyAssignments: vi.fn<(data: unknown[]) => Promise<void>>(),
}));

vi.mock("./wkLoad.ts", () => ({
  wkLoad: { subjects: mocks.subjects, assignments: mocks.assignments },
}));

vi.mock("./itemDB.ts", () => ({
  getSyncedAt: mocks.getSyncedAt,
  setSyncedAt: mocks.setSyncedAt,
  getSyncScope: mocks.getSyncScope,
  setSyncScope: mocks.setSyncScope,
  clearAssignments: mocks.clearAssignments,
  addManySubjects: mocks.addManySubjects,
  addManyAssignments: mocks.addManyAssignments,
}));

const page = (ids: number[], nextUrl: string | null) => ({
  data: ids.map((id) => ({ id, object: "kanji", data_updated_at: "2026-02-01T00:00:00.000000Z" })),
  pages: { next_url: nextUrl },
});

const NEXT =
  "https://api.wanikani.com/v2/subjects?types=kanji,vocabulary,kana_vocabulary&page_after_id=500";

const SINCE = "2026-01-15T10:00:00.000000Z";

/** The account scope the mocked database already holds, so most tests look like a repeat visit. */
const SCOPE = "user-1:60";
const OTHER_SCOPE = "user-2:3";

const HOUR = 60 * 60 * 1000;
const NOW = "2026-03-01T12:00:00.000Z";
const ago = (ms: number) => new Date(Date.parse(NOW) - ms).toISOString();

describe("getSync", () => {
  let apiKey: string;

  beforeEach(() => {
    vi.clearAllMocks();
    // getSync caches per API key, so each test uses its own key.
    apiKey = `key-${Math.random()}`;
    mocks.getSyncedAt.mockResolvedValue(null);
    mocks.setSyncedAt.mockResolvedValue(undefined);
    mocks.getSyncScope.mockResolvedValue(SCOPE);
    mocks.setSyncScope.mockResolvedValue(undefined);
    mocks.clearAssignments.mockResolvedValue(undefined);
    mocks.subjects.mockReset();
    mocks.subjects.mockResolvedValue(page([], null));
    mocks.assignments.mockReset();
    mocks.assignments.mockResolvedValue({ data: [], pages: { next_url: null } });
    mocks.addManyAssignments.mockResolvedValue(undefined);
    mocks.addManySubjects.mockResolvedValue(undefined);
  });

  it("follows next_url through every page on a full sync", async () => {
    mocks.subjects.mockResolvedValueOnce(page([1, 2], NEXT)).mockResolvedValueOnce(page([3], null));

    const { getSync } = await import("./wkSync.ts");
    await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

    expect(mocks.subjects).toHaveBeenCalledTimes(2);
    expect(new URL(mocks.subjects.mock.calls[0][0].url).searchParams.has("updated_after")).toBe(
      false,
    );
    expect(mocks.subjects.mock.calls[1][0].url).toBe(NEXT);
    expect(mocks.addManySubjects).toHaveBeenCalledTimes(2);
  });

  it("follows next_url on an incremental sync using the stored timestamp", async () => {
    mocks.getSyncedAt.mockImplementation(async (resource) =>
      resource === "subjects" ? SINCE : null,
    );
    mocks.subjects.mockResolvedValueOnce(page([1], NEXT)).mockResolvedValueOnce(page([2], null));

    const { getSync } = await import("./wkSync.ts");
    await getSync(apiKey, SCOPE);

    expect(mocks.subjects).toHaveBeenCalledTimes(2);
    const firstUrl = new URL(mocks.subjects.mock.calls[0][0].url);
    expect(firstUrl.searchParams.get("updated_after")).toBe(SINCE);
    expect(mocks.subjects.mock.calls[1][0].url).toBe(NEXT);
  });

  it("commits the synced-at timestamp only after the last page, taken before the first request", async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));
      mocks.subjects.mockImplementation(async () => {
        // Time passes during the run; the stored timestamp must not drift forward.
        vi.setSystemTime(new Date("2026-03-01T12:10:00.000Z"));
        expect(mocks.setSyncedAt).not.toHaveBeenCalledWith("subjects", expect.anything());
        return page([1], null);
      });

      const { getSync } = await import("./wkSync.ts");
      await getSync(apiKey, SCOPE);

      const [, timestamp] = mocks.setSyncedAt.mock.calls.find(([name]) => name === "subjects")!;
      // Started at 12:00, minus the 5 minute clock-skew margin.
      expect(timestamp).toBe("2026-03-01T11:55:00.000Z");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not advance the timestamp when a later page fails, so the next run starts over", async () => {
    const error = new Error("boom");
    mocks.subjects.mockResolvedValueOnce(page([1], NEXT)).mockRejectedValueOnce(error);
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { getSync } = await import("./wkSync.ts");
    await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "failed", error });

    expect(mocks.addManySubjects).toHaveBeenCalledTimes(1);
    expect(mocks.setSyncedAt).not.toHaveBeenCalledWith("subjects", expect.anything());
  });

  it("still commits a resource that finished while the other one failed", async () => {
    mocks.subjects.mockRejectedValue(new Error("boom"));
    mocks.assignments.mockResolvedValue(page([5], null));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { getSync } = await import("./wkSync.ts");
    const result = await getSync(apiKey, SCOPE);

    expect(result.status).toBe("failed");
    expect(mocks.setSyncedAt).toHaveBeenCalledTimes(1);
    expect(mocks.setSyncedAt).toHaveBeenCalledWith("assignments", expect.any(String));
  });

  it("caches a failure until retrySync is called, then syncs again", async () => {
    mocks.subjects.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(page([1], null));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { getSync, retrySync } = await import("./wkSync.ts");
    const first = await getSync(apiKey, SCOPE);
    expect(first.status).toBe("failed");

    await getSync(apiKey, SCOPE);
    expect(mocks.subjects).toHaveBeenCalledTimes(1);

    retrySync(apiKey);
    await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });
    expect(mocks.subjects).toHaveBeenCalledTimes(2);
    expect(mocks.setSyncedAt).toHaveBeenCalledWith("subjects", expect.any(String));
  });

  it("reports a failure when the stored timestamps cannot be read", async () => {
    mocks.getSyncedAt.mockRejectedValue(new Error("idb broke"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { getSync } = await import("./wkSync.ts");
    const result = await getSync(apiKey, SCOPE);

    expect(result.status).toBe("failed");
    expect(mocks.subjects).not.toHaveBeenCalled();
  });

  it("does nothing without an API key", async () => {
    const { getSync } = await import("./wkSync.ts");
    await expect(getSync("", SCOPE)).resolves.toEqual({ status: "ok" });
    expect(mocks.subjects).not.toHaveBeenCalled();
  });

  it("clears the assignments store before a full assignments sync", async () => {
    const { getSync } = await import("./wkSync.ts");
    await getSync(apiKey, SCOPE);

    expect(mocks.clearAssignments).toHaveBeenCalledTimes(1);
    expect(mocks.clearAssignments.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.assignments.mock.invocationCallOrder[0],
    );
  });

  it("does not clear assignments on an incremental sync", async () => {
    mocks.getSyncedAt.mockImplementation(async (resource) =>
      resource === "assignments" ? SINCE : null,
    );

    const { getSync } = await import("./wkSync.ts");
    await getSync(apiKey, SCOPE);

    expect(mocks.clearAssignments).not.toHaveBeenCalled();
    expect(new URL(mocks.assignments.mock.calls[0][0].url).searchParams.get("updated_after")).toBe(
      SINCE,
    );
  });

  it("does not rewrite the scope when it already matches", async () => {
    const { getSync } = await import("./wkSync.ts");
    await getSync(apiKey, SCOPE);

    expect(mocks.setSyncScope).not.toHaveBeenCalled();
  });

  describe("freshness", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(NOW));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("skips a resource synced an hour ago", async () => {
      mocks.getSyncedAt.mockResolvedValue(ago(HOUR));

      const { getSync } = await import("./wkSync.ts");
      await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

      expect(mocks.subjects).not.toHaveBeenCalled();
      expect(mocks.assignments).not.toHaveBeenCalled();
      expect(mocks.setSyncedAt).not.toHaveBeenCalled();
      expect(mocks.clearAssignments).not.toHaveBeenCalled();
    });

    it("skips a resource synced just under 12 hours ago", async () => {
      mocks.getSyncedAt.mockResolvedValue(ago(12 * HOUR - 1000));

      const { getSync } = await import("./wkSync.ts");
      await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

      expect(mocks.subjects).not.toHaveBeenCalled();
      expect(mocks.assignments).not.toHaveBeenCalled();
    });

    it("runs an incremental sync for a resource synced exactly 12 hours ago", async () => {
      const twelveHoursAgo = ago(12 * HOUR);
      mocks.getSyncedAt.mockResolvedValue(twelveHoursAgo);

      const { getSync } = await import("./wkSync.ts");
      await getSync(apiKey, SCOPE);

      expect(mocks.subjects).toHaveBeenCalledTimes(1);
      expect(new URL(mocks.subjects.mock.calls[0][0].url).searchParams.get("updated_after")).toBe(
        twelveHoursAgo,
      );
      expect(mocks.assignments).toHaveBeenCalledTimes(1);
      expect(
        new URL(mocks.assignments.mock.calls[0][0].url).searchParams.get("updated_after"),
      ).toBe(twelveHoursAgo);
    });

    it("syncs only the stale resource when the other one is fresh", async () => {
      const staleSince = ago(13 * HOUR);
      mocks.getSyncedAt.mockImplementation(async (resource) =>
        resource === "subjects" ? ago(HOUR) : staleSince,
      );

      const { getSync } = await import("./wkSync.ts");
      await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

      expect(mocks.subjects).not.toHaveBeenCalled();
      expect(mocks.assignments).toHaveBeenCalledTimes(1);
      expect(
        new URL(mocks.assignments.mock.calls[0][0].url).searchParams.get("updated_after"),
      ).toBe(staleSince);
      expect(mocks.setSyncedAt).toHaveBeenCalledTimes(1);
      expect(mocks.setSyncedAt).toHaveBeenCalledWith("assignments", expect.any(String));
    });

    it("makes no requests when both resources are fresh and the scope matches", async () => {
      mocks.getSyncedAt.mockResolvedValue(ago(HOUR));

      const { getSync } = await import("./wkSync.ts");
      await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

      expect(mocks.subjects).not.toHaveBeenCalled();
      expect(mocks.assignments).not.toHaveBeenCalled();
      expect(mocks.addManySubjects).not.toHaveBeenCalled();
      expect(mocks.addManyAssignments).not.toHaveBeenCalled();
      expect(mocks.setSyncedAt).not.toHaveBeenCalled();
      expect(mocks.setSyncScope).not.toHaveBeenCalled();
    });

    it("ignores fresh timestamps when the scope changed and runs a full sync", async () => {
      mocks.getSyncScope.mockResolvedValue(OTHER_SCOPE);
      mocks.getSyncedAt.mockResolvedValue(ago(HOUR));

      const { getSync } = await import("./wkSync.ts");
      await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

      expect(mocks.subjects).toHaveBeenCalledTimes(1);
      expect(new URL(mocks.subjects.mock.calls[0][0].url).searchParams.has("updated_after")).toBe(
        false,
      );
      expect(mocks.assignments).toHaveBeenCalledTimes(1);
      expect(
        new URL(mocks.assignments.mock.calls[0][0].url).searchParams.has("updated_after"),
      ).toBe(false);
      expect(mocks.clearAssignments).toHaveBeenCalledTimes(1);
      expect(mocks.setSyncScope).toHaveBeenCalledWith(SCOPE);
    });

    it("keeps the old scope when a full sync for a new scope fails", async () => {
      mocks.getSyncScope.mockResolvedValue(OTHER_SCOPE);
      mocks.subjects.mockRejectedValue(new Error("boom"));
      vi.spyOn(console, "error").mockImplementation(() => {});

      const { getSync } = await import("./wkSync.ts");
      const result = await getSync(apiKey, SCOPE);

      expect(result.status).toBe("failed");
      expect(mocks.setSyncScope).not.toHaveBeenCalled();
    });

    it("writes the scope after a full run when none was stored yet", async () => {
      mocks.getSyncScope.mockResolvedValue(null);

      const { getSync } = await import("./wkSync.ts");
      await expect(getSync(apiKey, SCOPE)).resolves.toEqual({ status: "ok" });

      expect(mocks.setSyncScope).toHaveBeenCalledWith(SCOPE);
    });
  });
});

describe("isFresh", () => {
  it("is false when there is no timestamp", async () => {
    const { isFresh } = await import("./wkSync.ts");
    expect(isFresh(null, Date.parse(NOW))).toBe(false);
  });

  it("is false for an unparsable timestamp", async () => {
    const { isFresh } = await import("./wkSync.ts");
    expect(isFresh("not a date", Date.parse(NOW))).toBe(false);
  });

  it("is false for a timestamp in the future", async () => {
    const { isFresh } = await import("./wkSync.ts");
    expect(isFresh(ago(-HOUR), Date.parse(NOW))).toBe(false);
  });

  it("is true for a timestamp an hour old and false at exactly 12 hours", async () => {
    const { isFresh } = await import("./wkSync.ts");
    expect(isFresh(ago(HOUR), Date.parse(NOW))).toBe(true);
    expect(isFresh(ago(12 * HOUR), Date.parse(NOW))).toBe(false);
  });
});
