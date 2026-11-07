import { test, expect } from "./support/test.ts";

test("Alt+M marks current item and raises count", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  await expect(page.getByRole("link", { name: /Marked Items \(0\)/ })).toBeVisible();
  await page.keyboard.press("Alt+m");
  await expect(page.getByRole("link", { name: /Marked Items \(1\)/ })).toBeVisible();
});

test("marked item appears on Marked page", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  await page.keyboard.press("Alt+m");
  await page.getByRole("link", { name: /Marked Items/ }).click();
  // 一 should be visible on the marked page
  await expect(page.locator(".text-9xl")).toBeVisible();
});

test("clear marked items resets count to zero", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  await page.keyboard.press("Alt+m");
  await expect(page.getByRole("link", { name: /Marked Items \(1\)/ })).toBeVisible();
  await page.goto("/settings");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear marked items" }).click();
  await expect(page.getByRole("link", { name: /Marked Items \(0\)/ })).toBeVisible();
});
