import { test, expect } from "./support/test.ts";

test("logged-out user visiting any non-settings path goes to /settings", async ({ page }) => {
  await page.goto("/kanji");
  await expect(page).toHaveURL(/\/settings/);
});

test("bad token keeps the user logged out", async ({ page }) => {
  await page.routeFromHAR("e2e/fixtures/wanikani.har", {
    url: /api\.wanikani\.com/,
    notFound: "abort",
  });
  await page.route(
    (url) => url.hostname === "api.wanikani.com" && url.pathname === "/v2/user",
    async (route, request) => {
      const auth = request.headers()["authorization"] ?? "";
      if (auth.includes("bad-token")) {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Unauthorized" }),
        });
      } else {
        await route.fallback();
      }
    },
  );
  await page.goto("/settings");
  await page.getByLabel("API Key").fill("bad-token");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("WaniKani did not accept this API key")).toBeVisible();
  await expect(page.getByRole("link", { name: "Kanji" })).not.toBeVisible();
});

test("network failure shows a retry instead of the logged-out state", async ({ page }) => {
  let offline = true;
  await page.routeFromHAR("e2e/fixtures/wanikani.har", {
    url: /api\.wanikani\.com/,
    notFound: "abort",
  });
  await page.route(
    (url) => url.hostname === "api.wanikani.com" && url.pathname === "/v2/user",
    async (route) => {
      if (offline) {
        await route.abort();
      } else {
        await route.fallback();
      }
    },
  );
  await page.goto("/settings");
  await page.getByLabel("API Key").fill("test-token");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Could not reach WaniKani")).toBeVisible();

  offline = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("link", { name: "Kanji" })).toBeVisible({ timeout: 30_000 });
});

test("failed sync shows a banner and retry completes it", async ({ page }) => {
  let offline = true;
  await page.routeFromHAR("e2e/fixtures/wanikani.har", {
    url: /api\.wanikani\.com/,
    notFound: "abort",
  });
  await page.route(
    (url) => url.hostname === "api.wanikani.com" && url.pathname === "/v2/subjects",
    async (route) => {
      if (offline) {
        await route.abort();
      } else {
        await route.fallback();
      }
    },
  );
  await page.goto("/settings");
  await page.getByLabel("API Key").fill("test-token");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert")).toContainText("Updating data from WaniKani failed", {
    timeout: 30_000,
  });
  await expect(page.getByRole("link", { name: "Kanji" })).toBeVisible();

  offline = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0, { timeout: 30_000 });
  await page.getByRole("link", { name: "Kanji" }).click();
  await expect(page.getByText("1 / ")).toBeVisible();
});

test("good token shows updating screen then nav with username", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await expect(page.getByRole("link", { name: "Kanji" })).toBeVisible();
  await expect(page.getByText("test-user")).toBeVisible();
});

test("reload within 12 hours skips the data sync", async ({ page, loggedIn: _loggedIn }) => {
  const requested: URL[] = [];
  page.on("request", (request) => requested.push(new URL(request.url())));

  await page.reload();
  await page.getByRole("link", { name: "Kanji" }).waitFor({ timeout: 30_000 });

  const wanikaniPaths = requested
    .filter((url) => url.hostname === "api.wanikani.com")
    .map((url) => url.pathname);
  expect(wanikaniPaths).toContain("/v2/user");
  expect(wanikaniPaths).not.toContain("/v2/subjects");
  expect(wanikaniPaths).not.toContain("/v2/assignments");
});

test("reload after 12 hours runs an incremental sync", async ({ page, loggedIn: _loggedIn }) => {
  await page.evaluate(async () => {
    const thirteenHoursAgo = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString();
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("db");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("meta", "readwrite");
      tx.objectStore("meta").put({ key: "syncedAt:subjects", value: thirteenHoursAgo });
      tx.objectStore("meta").put({ key: "syncedAt:assignments", value: thirteenHoursAgo });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });

  const requested: URL[] = [];
  page.on("request", (request) => requested.push(new URL(request.url())));

  await page.reload();
  await page.getByRole("link", { name: "Kanji" }).waitFor({ timeout: 30_000 });

  const incrementalPaths = requested
    .filter((url) => url.hostname === "api.wanikani.com" && url.searchParams.has("updated_after"))
    .map((url) => url.pathname);
  expect(incrementalPaths).toContain("/v2/subjects");
  expect(incrementalPaths).toContain("/v2/assignments");
});

test("logged-out visit to / redirects to /settings", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/settings/);
});
