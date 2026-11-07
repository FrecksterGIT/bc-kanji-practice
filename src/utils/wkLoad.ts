import { createCache } from "async-cache-dedupe";
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

const fetchFn = async <T>({ url, apiKey }: { url: string; apiKey: string }): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Wanikani-Revision": "20170710",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!response.ok) {
    throw new WanikaniHttpError(response.status, response.statusText);
  }
  return response.json();
};

export const wkLoad = createCache({
  storage: { type: "memory" },
})
  .define("assignments", fetchFn<WanikaniCollection<WanikaniAssignment>>)
  .define("subjects", fetchFn<WanikaniCollection<WanikaniSubject>>)
  .define("user", fetchFn<WanikaniResourceResponse<WanikaniUserData>>);
