import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { MAX_RETRIES, WanikaniHttpError, wkLoad } from "./wkLoad.ts";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { status: 200, ...init });

const request = { url: "https://api.wanikani.com/v2/subjects", apiKey: "key" };

describe("wkLoad", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("sends the API key and revision header and returns the parsed body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));

    await expect(wkLoad.subjects(request)).resolves.toEqual({ data: [] });

    const init = fetchMock.mock.calls[0][1]!;
    expect(init.headers).toMatchObject({
      Authorization: "Bearer key",
      "Wanikani-Revision": "20170710",
    });
  });

  it("does not retry client errors such as an invalid key", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401, statusText: "Unauthorized" }));

    await expect(wkLoad.user(request)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("waits for RateLimit-Reset after a 429, then succeeds", async () => {
    vi.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));
    const resetAt = Date.now() / 1000 + 10;
    fetchMock
      .mockResolvedValueOnce(
        new Response(null, { status: 429, headers: { "RateLimit-Reset": String(resetAt) } }),
      )
      .mockResolvedValueOnce(jsonResponse({ data: [1] }));

    const result = wkLoad.subjects(request);
    await vi.advanceTimersByTimeAsync(9_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(result).resolves.toEqual({ data: [1] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("backs off exponentially on server errors", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }));

    const result = wkLoad.assignments(request);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(result).resolves.toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("gives up after MAX_RETRIES retries and throws the last HTTP error", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500, statusText: "Server Error" }));

    const outcome = wkLoad.subjects(request).catch((error: unknown) => error);
    await vi.runAllTimersAsync();

    expect(await outcome).toBeInstanceOf(WanikaniHttpError);

    expect(fetchMock).toHaveBeenCalledTimes(MAX_RETRIES + 1);
  });

  it("does not retry network failures", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(wkLoad.user(request)).rejects.toBeInstanceOf(TypeError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
