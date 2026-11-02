import { test, expect } from "./support/test.ts";

test("romaji ichi converts to いち", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  const input = page.locator("#reading");
  await input.pressSequentially("ichi");
  await expect(input).toHaveValue("いち");
});

test("nn converts to ん", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  const input = page.locator("#reading");
  await input.pressSequentially("nn");
  await expect(input).toHaveValue("ん");
});

test("wrong answer shows red border", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  const input = page.locator("#reading");
  await input.pressSequentially("wrong");
  await input.press("Enter");
  await expect(input).toHaveClass(/border-red-500/);
});

test("correct answer shows green border", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  const input = page.locator("#reading");
  await input.pressSequentially("ichi");
  await expect(input).toHaveValue("いち");
  await input.press("Enter");
  await expect(input).toHaveClass(/border-green-500/);
});

test("Enter on correct answer advances to next item", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  const input = page.locator("#reading");
  // Answer correctly for first item (一, reading いち)
  await input.pressSequentially("ichi");
  await expect(input).toHaveValue("いち");
  await input.press("Enter");
  await expect(input).toHaveClass(/border-green-500/);
  // Press Enter again to advance
  const positionBefore = await page.getByText(/1 \/ \d+/).textContent();
  await input.press("Enter");
  const positionAfter = await page.getByText(/\d+ \/ \d+/).textContent();
  expect(positionAfter).not.toBe(positionBefore);
});

test("Alt+S reveals blurred details", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  // Details are blurred initially
  await expect(page.locator(".blur-md").first()).toBeVisible();
  await page.keyboard.press("Alt+s");
  // After Alt+S, blur-md is removed
  await expect(page.locator(".blur-md")).toHaveCount(0);
});

test("Left/Right arrows change item position", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  await page.getByText(/1 \/ \d+/).waitFor();
  // Items load twice: once immediately, then again after getAllAssignments completes and
  // updates filterAndSort. The second load's setData call changes the items reference,
  // which triggers ItemProvider's useEffect([items]) → setSelectedIndex(0) reset.
  // Wait for DOM to be stable for 100ms before dispatching so the reset has fired.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let t = setTimeout(resolve, 100);
        const obs = new MutationObserver(() => {
          clearTimeout(t);
          t = setTimeout(resolve, 100);
        });
        obs.observe(document.body, { childList: true, subtree: true, characterData: true });
      }),
  );

  await page.evaluate(() =>
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
    ),
  );
  await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
  await page.evaluate(() =>
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }),
    ),
  );
  await expect(page.getByText(/1 \/ \d+/)).toBeVisible();
});

test("related vocabulary shows for kanji 一", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/kanji");
  // 一 is first (id 440), related vocab: 一 (2467) and 一つ (2526)
  await expect(page.getByText("一つ")).toBeVisible();
});

test("vocabulary shows composition and context sentence", async ({ page, loggedIn: _loggedIn }) => {
  await page.goto("/vocabulary");
  // Reveal details (blurred by default)
  await page.keyboard.press("Alt+s");
  // Context sentence "Let's count to one." should appear
  await expect(page.getByText("Let's count to one.")).toBeVisible();
});
