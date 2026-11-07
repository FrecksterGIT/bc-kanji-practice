import {
  WanikaniAssignment,
  WanikaniCollection,
  WanikaniResourceResponse,
  WanikaniSubject,
  WanikaniUserData,
} from "../wanikani";

export class WanikaniHttpError extends Error {
  constructor(
    readonly status: number,
    statusText: string,
  ) {
    super(`Error fetching data: ${statusText}`);
    this.name = "WanikaniHttpError";
  }
}

export const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 60_000;

const isRetryable = (status: number) => status === 429 || status >= 500;

/**
 * How long to wait before retrying. For 429 WaniKani sends `RateLimit-Reset` (epoch seconds
 * when the window resets); otherwise, or when the header is missing, back off exponentially.
 */
const retryDelay = (response: Response, attempt: number): number => {
  const reset = Number(response.headers.get("RateLimit-Reset"));
  if (response.status === 429 && Number.isFinite(reset) && reset > 0) {
    return Math.min(Math.max(reset * 1000 - Date.now(), BASE_DELAY_MS), MAX_DELAY_MS);
  }
  return BASE_DELAY_MS * 2 ** attempt;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const fetchFn = async <T>({ url, apiKey }: { url: string; apiKey: string }): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Wanikani-Revision": "20170710",
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (response.ok) {
      return response.json();
    }
    if (!isRetryable(response.status) || attempt >= MAX_RETRIES) {
      throw new WanikaniHttpError(response.status, response.statusText);
    }
    await sleep(retryDelay(response, attempt));
  }
};

export const wkLoad = {
  assignments: fetchFn<WanikaniCollection<WanikaniAssignment>>,
  subjects: fetchFn<WanikaniCollection<WanikaniSubject>>,
  user: fetchFn<WanikaniResourceResponse<WanikaniUserData>>,
};
