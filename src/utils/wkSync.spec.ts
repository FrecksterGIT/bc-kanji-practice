import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  subjects: vi.fn<(request: { url: string; apiKey: string }) => Promise<unknown>>(),
  assignments: vi.fn<(request: { url: string; apiKey: string }) => Promise<unknown>>(),
  getAllSubjects: vi.fn<() => Promise<unknown[]>>(),
  getAllAssignments: vi.fn<() => Promise<unknown[]>>(),
  addManySubjects: vi.fn<(data: unknown[]) => Promise<void>>(),
  addManyAssignments: vi.fn<(data: unknown[]) => Promise<void>>(),
}));

vi.mock("./wkLoad.ts", () => ({
  wkLoad: { subjects: mocks.subjects, assignments: mocks.assignments },
}));

vi.mock("./itemDB.ts", () => ({
  getAllSubjects: mocks.getAllSubjects,
  getAllAssignments: mocks.getAllAssignments,
  addManySubjects: mocks.addManySubjects,
  addManyAssignments: mocks.addManyAssignments,
}));

const page = (ids: number[], nextUrl: string | null) => ({
  data: ids.map((id) => ({ id, object: "kanji", data_updated_at: "2026-02-01T00:00:00.000000Z" })),
  pages: { next_url: nextUrl },
});

const NEXT =
  "https://api.wanikani.com/v2/subjects?types=kanji,vocabulary,kana_vocabulary&page_after_id=500";

describe("getSync", () => {
  let apiKey: string;

  beforeEach(() => {
    vi.clearAllMocks();
    // getSync caches per API key, so each test uses its own key.
    apiKey = `key-${Math.random()}`;
    mocks.assignments.mockResolvedValue({ data: [], pages: { next_url: null } });
    mocks.getAllAssignments.mockResolvedValue([]);
    mocks.addManyAssignments.mockResolvedValue(undefined);
    mocks.addManySubjects.mockResolvedValue(undefined);
  });

  it("follows next_url through every page on a full sync", async () => {
    mocks.getAllSubjects.mockResolvedValue([]);
    mocks.subjects.mockResolvedValueOnce(page([1, 2], NEXT)).mockResolvedValueOnce(page([3], null));

    const { getSync } = await import("./wkSync.ts");
    await getSync(apiKey);

    expect(mocks.subjects).toHaveBeenCalledTimes(2);
    expect(mocks.subjects.mock.calls[1][0].url).toBe(NEXT);
    expect(mocks.addManySubjects).toHaveBeenCalledTimes(2);
  });

  it("follows next_url on an incremental sync instead of stopping at the first page", async () => {
    mocks.getAllSubjects.mockResolvedValue([
      { id: 9, object: "kanji", data_updated_at: "2026-01-15T10:00:00.000000Z" },
    ]);
    mocks.subjects.mockResolvedValueOnce(page([1], NEXT)).mockResolvedValueOnce(page([2], null));

    const { getSync } = await import("./wkSync.ts");
    await getSync(apiKey);

    expect(mocks.subjects).toHaveBeenCalledTimes(2);
    const firstUrl = new URL(mocks.subjects.mock.calls[0][0].url);
    expect(firstUrl.searchParams.get("updated_after")).toBe("2026-01-15T10:00:00.000000Z");
    expect(mocks.subjects.mock.calls[1][0].url).toBe(NEXT);
  });
});
