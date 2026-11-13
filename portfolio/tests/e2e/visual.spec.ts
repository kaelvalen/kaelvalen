import { expect, test } from "@playwright/test";

// Pixel baselines live in tests/e2e/__screenshots__ and are made in the CI container
// (npm run test:visual:update inside mcr.microsoft.com/playwright), so fonts and rasterisation match.
// The sky is pinned through the reader's saved choice and the clock is fixed, so the moon and the map
// draw the same every run. Canvases are hidden rather than masked (the map fills the hero, so a mask
// would cover the text on it): they are tested by behaviour, not pixels.
test.use({ reducedMotion: "reduce", locale: "en-US" });

for (const theme of ["light", "dark"] as const) {
  for (const sheet of ["top", "projects", "research", "contact"]) {
    test(`${sheet} · ${theme}`, async ({ page }) => {
      await page.clock.setFixedTime(new Date("2026-11-13T18:00:00Z"));
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto(sheet === "top" ? "/" : `/${sheet}`);
      await page.waitForLoadState("networkidle");
      await page.addStyleTag({ content: "canvas{visibility:hidden}" });
      // Every face, not just the ones already requested: the mono face is not preloaded and would swap in late.
      await page.evaluate(() =>
        Promise.all([...document.fonts].filter((f) => !f.family.includes("Fallback")).map((f) => f.load().catch(() => null))).then(() => document.fonts.ready)
      );
      if (sheet === "research") {
        await page.locator("#fig-1").scrollIntoViewIfNeeded();
        await expect(page.locator("#recorder-status")).toContainText("Nominal");
        await page.locator(`[data-sheet-id="${sheet}"]`).evaluate((el) => el.scrollIntoView());
      }
      const el = page.locator(`[data-sheet-id="${sheet}"]`);
      await expect(el).toHaveScreenshot(`${sheet}-${theme === "light" ? "day" : "night"}.png`, {
        mask: [el.locator("[data-plot-pen]")],
      });
    });
  }
}
