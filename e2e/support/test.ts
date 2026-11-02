import { test as base, expect } from "@playwright/test";

const emptyCollection = {
  object: "collection",
  url: "",
  data_updated_at: new Date().toISOString(),
  total_count: 0,
  pages: { per_page: 500, next_url: null, previous_url: null },
  data: [],
};

export const test = base.extend<{ loggedIn: void }>({
  loggedIn: async ({ page }, use) => {
    // HAR has lowest priority — page.route handlers registered after override it
    await page.routeFromHAR("e2e/fixtures/wanikani.har", {
      url: /api\.wanikani\.com/,
      notFound: "abort",
    });

    // Abort audio requests
    await page.route("**/*.mp3", (route) => route.abort());

    // Return empty collection for updated_after requests (incremental sync)
    await page.route(
      (url) =>
        url.hostname === "api.wanikani.com" &&
        (url.pathname === "/v2/subjects" || url.pathname === "/v2/assignments") &&
        url.searchParams.has("updated_after"),
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(emptyCollection),
        });
      },
    );

    // Return 401 for bad-token, fall through to HAR for everything else
    await page.route(
      (url) => url.hostname === "api.wanikani.com" && url.pathname === "/v2/user",
      async (route, request) => {
        const auth = request.headers()["authorization"] ?? "";
        if (auth.includes("bad-token")) {
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ error: "Unauthorized", code: 401 }),
          });
        } else {
          await route.fallback();
        }
      },
    );

    await page.goto("/settings");
    await page.getByLabel("API Key").fill("test-token");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("link", { name: "Kanji" }).waitFor({ timeout: 30_000 });

    await use();
  },
});

export { expect };
