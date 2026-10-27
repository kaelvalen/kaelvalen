import { expect, test } from "@playwright/test";

// Pixel baselines live in tests/e2e/__screenshots__ and are made in the CI container
// (npm run test:visual:update inside mcr.microsoft.com/playwright), so fonts and rasterisation match.
// The GPU-drawn hero and the paper fibre are masked or flattened: they are tested by behaviour, not pixels.
test.use({ reducedMotion: "reduce", locale: "en-US" });

for (const colorScheme of ["light", "dark"] as const) {
  for (const sheet of ["top", "research", "projects", "toolbox", "contact"]) {
    test(`${sheet} · ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(sheet === "top" ? "/" : `/${sheet}`);
      await page.addStyleTag({ content: "body{background-image:none!important}" });
      await page.waitForLoadState("networkidle");
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
      await expect(el).toHaveScreenshot(`${sheet}-${colorScheme}.png`, {
        // Only this sheet's GPU canvas: a page-wide mask would land on other sheets' shots by scroll position.
        mask: [el.locator("canvas"), el.locator("[data-plot-pen]")],
      });
    });
  }
}
