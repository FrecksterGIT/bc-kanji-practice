import type { Page } from "@playwright/test";
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

// Level 1 kanji in the HAR fixture, in id order: 一 (いち), 口 (こう), 八 (はち).
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let timer = setTimeout(done, 150);
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(done, 150);
        });
        function done() {
          observer.disconnect();
          resolve();
        }
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      }),
  );

// A focused text input makes page.keyboard.press("Arrow…") unreliable in headless Chromium.
const arrow = (page: Page, key: "ArrowLeft" | "ArrowRight") =>
  page.evaluate((k) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k })), key);

const markAllLevelOneKanji = async (page: Page) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  await settle(page);
  await page.keyboard.press("Alt+m");
  await arrow(page, "ArrowRight");
  await page.keyboard.press("Alt+m");
  await arrow(page, "ArrowRight");
  await page.keyboard.press("Alt+m");
  await expect(page.getByRole("link", { name: /Marked Items \(3\)/ })).toBeVisible();
  await page.getByRole("link", { name: /Marked Items/ }).click();
  await expect(page.getByText("1 / 3")).toBeVisible();
  await settle(page);
};

const answer = async (page: Page, romaji: string) => {
  const input = page.locator("#reading");
  await input.pressSequentially(romaji);
  await input.press("Enter");
  await expect(input).toHaveClass(/border-green-500/);
};

const correctMark = (page: Page) => page.locator("form + span");

test("unmarking in the Marked view keeps progress and shows the next item", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await markAllLevelOneKanji(page);
  // answer 八 (3rd), go back to 一 (1st) and unmark it
  await arrow(page, "ArrowLeft");
  await expect(page.getByText("3 / 3")).toBeVisible();
  await answer(page, "hachi");
  await arrow(page, "ArrowRight");
  await expect(page.getByText("1 / 3")).toBeVisible();
  await page.keyboard.press("Alt+m");

  await expect(page.getByRole("link", { name: /Marked Items \(2\)/ })).toBeVisible();
  await expect(page.getByText("1 / 2")).toBeVisible();
  await expect(page.locator(".text-9xl")).toHaveText("口");
  // 八 is still answered correctly
  await arrow(page, "ArrowRight");
  await expect(page.getByText("2 / 2")).toBeVisible();
  await expect(page.locator(".text-9xl")).toHaveText("八");
  await expect(correctMark(page)).toBeVisible();
});

test("unmarking the last item in the Marked view shows the first item", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await markAllLevelOneKanji(page);
  await answer(page, "ichi");
  await arrow(page, "ArrowLeft");
  await expect(page.getByText("3 / 3")).toBeVisible();
  await page.keyboard.press("Alt+m");

  await expect(page.getByText("1 / 2")).toBeVisible();
  await expect(page.locator(".text-9xl")).toHaveText("一");
  await expect(correctMark(page)).toBeVisible();
});

test("unmarking every item in the Marked view shows the empty message", async ({
  page,
  loggedIn: _loggedIn,
}) => {
  await markAllLevelOneKanji(page);
  await page.keyboard.press("Alt+m");
  await page.keyboard.press("Alt+m");
  await page.keyboard.press("Alt+m");

  await expect(page.getByRole("link", { name: /Marked Items \(0\)/ })).toBeVisible();
  await expect(page.getByText("Sorry, couldn't find any items to show.")).toBeVisible();
});
