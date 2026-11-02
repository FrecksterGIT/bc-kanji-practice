import { test, expect } from "./support/test.ts";

test("limit to currently learned hides unstarted items", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  // All 3 level-1 kanji: 一 (440), 口 (441), 八 (442)
  await expect(page.getByText(/\/ 3/)).toBeVisible();

  await page.goto("/settings");
  await page.getByLabel("Limit content to currently learned").check();

  await page.goto("/kanji");
  // Only started kanji: 一 (440) and 八 (442) — 2 items
  await expect(page.getByText(/\/ 2/)).toBeVisible();
});

test("by next review date sorts by available_at", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/settings");
  // Enable nextReview sort
  await page.getByLabel("by next review date").check();

  await page.goto("/kanji");
  // 八 has available_at 2026-06-01 (earliest), 一 has 2027-01-01, 口 has none
  // So 八 should appear first
  await expect(page.locator(".text-9xl")).toContainText("八");
});

test("by WaniKani id gives default order", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/settings");
  await page.getByLabel("by WaniKani id").check();

  await page.goto("/kanji");
  // 一 (id 440) is first in id order
  await expect(page.locator(".text-9xl")).toContainText("一");
});

test("settings survive a page reload", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/settings");
  const checkbox = page.getByLabel("Limit content to currently learned");
  await checkbox.check();
  await expect(checkbox).toBeChecked();

  await page.reload();
  await page.getByRole("link", { name: "Kanji" }).waitFor({ timeout: 30_000 });
  await page.goto("/settings");
  await expect(page.getByLabel("Limit content to currently learned")).toBeChecked();
});
