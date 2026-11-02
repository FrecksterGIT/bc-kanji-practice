import { test } from "@playwright/test";

test("record WaniKani HAR", async ({ page }) => {
  process.loadEnvFile(".env");
  const apiKey = process.env["wkapikey"];
  if (!apiKey) throw new Error("wkapikey not set in .env");

  await page.routeFromHAR("e2e/fixtures/wanikani.har", {
    url: /api\.wanikani\.com/,
    update: true,
    updateContent: "embed",
    updateMode: "minimal",
  });

  await page.goto("/settings");
  await page.getByLabel("API Key").fill(apiKey);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("link", { name: "Kanji" }).waitFor({ timeout: 120_000 });
});
