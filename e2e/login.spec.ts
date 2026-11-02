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
  await page.waitForTimeout(2000);
  await expect(page.getByRole("link", { name: "Kanji" })).not.toBeVisible();
});

test("good token shows updating screen then nav with username", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await expect(page.getByRole("link", { name: "Kanji" })).toBeVisible();
  await expect(page.getByText("test-user")).toBeVisible();
});

test("second page load uses updated_after incremental sync", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await page.reload();
  await page.getByRole("link", { name: "Kanji" }).waitFor({ timeout: 30_000 });
  await expect(page.getByRole("link", { name: "Kanji" })).toBeVisible();
});

test("logged-out visit to / redirects to /settings", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/settings/);
});
