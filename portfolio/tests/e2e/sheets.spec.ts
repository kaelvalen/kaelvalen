import { expect, test } from "@playwright/test";

const SHEETS = [
  { path: "/", id: "top", title: /ML architecture researcher/ },
  { path: "/research", id: "research", title: /^Research/ },
  { path: "/projects", id: "projects", title: /^Projects/ },
  { path: "/toolbox", id: "toolbox", title: /^Toolbox/ },
  { path: "/contact", id: "contact", title: /^Contact/ },
];

test.use({ colorScheme: "light", locale: "en-US" });

for (const s of SHEETS) {
  test(`${s.path} opens at its sheet, cleanly`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(s.path);
    await expect(page).toHaveTitle(s.title);
    // Sheet 1 is the top of the page; any other sheet is scrolled to just under the sticky nav.
    if (s.id === "top") expect(await page.evaluate(() => scrollY)).toBe(0);
    else {
      // The sheet is re-aimed as fonts and late layout land, so wait for where the reader ends up.
      const top = () => page.locator(`[data-sheet-id="${s.id}"]`).evaluate((el) => Math.abs(el.getBoundingClientRect().top));
      await expect.poll(top, { timeout: 4000 }).toBeLessThan(80);
    }
    expect(errors).toEqual([]);
  });
}

test("the address follows the sheet in view, and the nav turns sheets", async ({ page, isMobile }) => {
  test.skip(isMobile, "the sheet links live in the desktop nav strip");
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /Projects/ }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page).toHaveTitle(/^Projects/);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("the palette takes a zone reference", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut");
  await page.goto("/");
  // The shortcut is live once the page has hydrated; keep pressing until the palette answers.
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("combobox")).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10000 });
  await page.getByRole("combobox").fill("3·C2");
  await expect(page.getByRole("option").first()).toHaveText(/Go to zone 3·C2/);
  await page.keyboard.press("Enter");
  await expect(page.locator(".animate-zone-flash")).toContainText("3·C2");
});

test("the theme switch exposes the other medium", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveAttribute("data-vt", /./, { timeout: 3000 });
  // The lamp canvas exists only while the exposure runs.
  await expect(page.locator('canvas[style*="exposure-lamp"]')).toHaveCount(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the recorder computes a whole run and catches the spike", async ({ page }) => {
    await page.goto("/research");
    const fig = page.locator("#fig-1");
    await fig.scrollIntoViewIfNeeded();
    await expect(page.locator("#recorder-status")).toContainText("Nominal");
    await fig.getByRole("slider").fill("4");
    await expect(page.locator("#recorder-status")).toHaveText(/Caught \d+ steps? before the spike/);
  });
});
