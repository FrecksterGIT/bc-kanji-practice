import { readFileSync, writeFileSync } from "node:fs";

process.loadEnvFile(".env");
const apiKey = process.env["wkapikey"] ?? "";

const harPath = "e2e/fixtures/wanikani.har";

interface HarEntry {
  request: { url: string; headers: unknown[]; cookies: unknown[] };
  response: {
    content: { text?: string; mimeType?: string };
    headers: unknown[];
    cookies: unknown[];
  };
}

interface SubjectData {
  object: string;
  id: number;
  data: { level: number; subject_id?: number };
}

const raw = JSON.parse(readFileSync(harPath, "utf-8")) as {
  log: { entries: HarEntry[] };
};

// Collect all subject ids at levels 1–2
const subjectIds = new Set<number>();
for (const entry of raw.log.entries) {
  if (!entry.request.url.includes("api.wanikani.com")) continue;
  const body = JSON.parse(entry.response.content.text ?? "{}") as {
    object: string;
    data: SubjectData[];
  };
  if (body.object === "collection" && Array.isArray(body.data)) {
    for (const item of body.data as SubjectData[]) {
      if (
        (item.object === "kanji" ||
          item.object === "vocabulary" ||
          item.object === "kana_vocabulary") &&
        item.data?.level <= 2
      ) {
        subjectIds.add(item.id);
      }
    }
  }
}

function sanitizeEntry(entry: HarEntry, bodyOverride?: unknown) {
  const resContent = bodyOverride
    ? { ...entry.response.content, text: JSON.stringify(bodyOverride) }
    : entry.response.content;
  return {
    ...entry,
    request: { ...entry.request, headers: [], cookies: [] },
    response: { ...entry.response, headers: [], cookies: [], content: resContent },
  };
}

const sanitized = { ...raw, log: { ...raw.log, entries: [] as unknown[] } };

for (const entry of raw.log.entries) {
  const url: string = entry.request.url;
  if (!url.includes("api.wanikani.com")) {
    sanitized.log.entries.push(sanitizeEntry(entry));
    continue;
  }

  const body = JSON.parse(entry.response.content.text ?? "{}") as {
    object: string;
    data: SubjectData[];
    total_count: number;
    pages: { next_url: string | null };
  };

  if (body.object === "user") {
    const userData = body as unknown as {
      object: string;
      data: {
        username: string;
        profile_url: string;
        started_at: string;
        level: number;
        subscription?: { period_ends_at: string };
      };
    };
    userData.data.username = "test-user";
    userData.data.profile_url = "https://www.wanikani.com/users/test-user";
    userData.data.started_at = "2024-01-01T00:00:00.000000Z";
    userData.data.level = 2;
    if (userData.data.subscription) {
      userData.data.subscription.period_ends_at = "2026-01-01T00:00:00.000000Z";
    }
    sanitized.log.entries.push(sanitizeEntry(entry, userData));
  } else if (body.object === "collection" && Array.isArray(body.data)) {
    let filtered = body.data;
    if ((filtered[0] as SubjectData | undefined)?.object === "assignment") {
      filtered = filtered.filter((a) =>
        subjectIds.has((a.data as { subject_id: number }).subject_id),
      );
    } else {
      filtered = filtered.filter((s) => s.data?.level <= 2);
    }
    body.data = filtered;
    body.total_count = filtered.length;
    body.pages.next_url = null;
    sanitized.log.entries.push(sanitizeEntry(entry, body));
  } else {
    sanitized.log.entries.push(sanitizeEntry(entry));
  }
}

const output = JSON.stringify(sanitized, null, 2);
if (apiKey && output.includes(apiKey)) {
  console.error("ERROR: API key found in sanitized HAR!");
  process.exit(1);
}
writeFileSync(harPath, output, "utf-8");
console.log(
  `Wrote ${sanitized.log.entries.length} entries, ${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`,
);
