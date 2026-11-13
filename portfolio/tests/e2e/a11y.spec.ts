import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The sky is pinned through the reader's saved choice, so the run does not depend on the time in Ankara.
for (const theme of ["light", "dark"] as const) {
  test(`no WCAG 2.2 AA violations under the ${theme === "light" ? "day" : "night"} sky`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
