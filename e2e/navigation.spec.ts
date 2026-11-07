import { test, expect } from "./support/test.ts";

test("level dropdown lists levels 1 up to the subscription cap", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  // Fixture: level 2 account with subscription.max_level_granted 60.
  const select = page.locator("#level-select");
  await expect(select.locator("option")).toHaveCount(60);
  await expect(select.locator("option").nth(0)).toHaveText("1");
  await expect(select.locator("option").nth(59)).toHaveText("60");
});

test("Alt+Down advances to next level", async ({ page, loggedIn: _loggedIn }) => {
  const select = page.locator("#level-select");
  await expect(select).toHaveValue("1");
  await page.keyboard.press("Alt+ArrowDown");
  await expect(select).toHaveValue("2");
});

test("Alt+Up wraps from level 1 to the highest level", async ({ page, loggedIn: _loggedIn }) => {
  const select = page.locator("#level-select");
  await expect(select).toHaveValue("1");
  await page.keyboard.press("Alt+ArrowUp");
  await expect(select).toHaveValue("60");
});

test("Alt+A opens item list", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  await page.keyboard.press("Alt+a");
  await expect(page.getByRole("heading", { name: "Kanji / Vocabulary" })).toBeVisible();
});

test("Escape closes item list", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  await page.keyboard.press("Alt+a");
  await expect(page.getByRole("heading", { name: "Kanji / Vocabulary" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Kanji / Vocabulary" })).not.toBeVisible();
});

test("help button opens overlay", async ({ page, loggedIn: _loggedIn }) => {
  await page.getByRole("button", { name: "Help" }).click();
  await expect(page.getByRole("heading", { name: "Help & Information" })).toBeVisible();
});

test("Escape closes help overlay", async ({ page, loggedIn: _loggedIn }) => {
  await page.getByRole("button", { name: "Help" }).click();
  await expect(page.getByRole("heading", { name: "Help & Information" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Help & Information" })).not.toBeVisible();
});

test("mobile viewport shows menu button and hides desktop nav", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kanji" })).not.toBeVisible();
});
