import { expect, test } from "@playwright/test";

const SHEETS = [
  { path: "/", id: "top", title: /ML systems researcher/ },
  { path: "/research", id: "research", title: /^Research/ },
  { path: "/projects", id: "projects", title: /^Work/ },
  { path: "/contact", id: "contact", title: /^Contact/ },
];

test.use({ locale: "en-US" });

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
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /Work/ }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page).toHaveTitle(/^Work/);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("the sky follows Ankara until the reader switches it, and the switch sweeps", async ({ page }) => {
  // 13:00 Ankara time in November: day.
  await page.clock.setFixedTime(new Date("2026-11-13T10:00:00Z"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /Switch to the night sky/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveAttribute("data-vt", /./, { timeout: 3000 });
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
  // Switching back to Ankara's own sky hands the page back to the sky.
  await page.getByRole("button", { name: /Switch to the day sky/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
});

test("at night in Ankara the page opens dark", async ({ page }) => {
  // 21:00 Ankara time.
  await page.clock.setFixedTime(new Date("2026-11-13T18:00:00Z"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: /night in Ankara/ })).toBeVisible();
});

test("a particle dropped beside the black hole falls in", async ({ page, isMobile }) => {
  test.skip(isMobile, "the hole sits above the copy on narrow screens; one layout is enough here");
  // The black hole is the night scene; by day the hero is the 1919 eclipse.
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  const hero = page.locator("#top");
  const live = hero.locator("p[aria-live=polite]");
  // Clicking the copy or the note over the scene should not drop a particle.
  await hero.locator("[data-hero-note]").click();
  await hero.locator("[data-hero-copy] h1").click();
  await expect(live).toHaveText("");

  // Released from rest a few r_s from the hole (components/Hero.tsx frame: 0.66 w, 0.4 h), it plunges.
  const box = (await hero.boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.66 + 140, box.y + box.height * 0.4);
  await expect(live).toHaveText("The particle fell straight in.", { timeout: 8000 });

  // Changing language translates the result.
  await page.getByRole("button", { name: /Türkçe'ye geç/ }).click();
  await expect(live).toHaveText("Parçacık doğrudan içeri düştü.");
});

test("command palette search folds Turkish İ and Latin I", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("locale", "tr"));
  await page.goto("/");
  const input = page.getByRole("combobox");
  // The "/" listener attaches on hydration; on a slow runner the first press can land before it.
  await expect(async () => {
    await page.keyboard.press("/");
    await expect(input).toBeVisible({ timeout: 1000 });
  }).toPass();
  for (const [q, expected] of [
    ["işler", /İşler/],
    ["iletişim", /İletişim/],
    ["relic", /Araştırma/],
    ["findings", /FINDINGS/],
  ] as const) {
    await input.fill(q);
    await expect(page.locator("[role=option]").first()).toContainText(expected);
  }
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
    const spikeStep = await fig.locator("dl dd").nth(3).textContent();
    // Scrolling away and returning keeps the completed spike instead of resetting the run.
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await fig.scrollIntoViewIfNeeded();
    await expect(page.locator("#recorder-status")).toHaveText(/Caught \d+ steps? before the spike/);
    expect(await fig.locator("dl dd").nth(3).textContent()).toBe(spikeStep);
  });
});
