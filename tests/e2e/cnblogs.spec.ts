import { test, expect } from "@playwright/test";
import manifest from "../../migrations/cnblogs/manifest.json";

test("all seven essays preserve their titles, tags, timestamps and code", async ({
  page,
}) => {
  await page.goto("/posts/");
  await expect(page.locator(".archive-row")).toHaveCount(7);
  for (const record of manifest.records) {
    await page.goto(`/posts/cnblogs-${record.id}/`);
    await expect(page.locator("h1")).toHaveText(record.title);
    await expect(page.locator(".article-header time")).toHaveAttribute(
      "datetime",
      record.published,
    );
    await expect(page.locator(".article-header time")).toContainText(
      record.published.slice(11, 19),
    );
    await expect(page.locator(".article-header-tags a")).toHaveText(
      record.tags,
    );
    await expect(page.locator(".article-prose pre")).toHaveCount(
      record.codeBlocks,
    );
  }
});

test("formulas, tables, tag browsing and imported search results work", async ({
  page,
}) => {
  await page.goto("/posts/cnblogs-17688982/");
  await expect(page.locator(".katex")).toHaveCount(9);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/cnblogs-math-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/cnblogs-math-mobile.png",
    fullPage: true,
  });
  await page.goto("/posts/cnblogs-19638493/");
  await expect(page.locator(".article-prose table tbody tr")).toHaveCount(11);
  await page
    .locator(".article-header-tags")
    .getByRole("link", { name: "git", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "如何 commit", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "搜索文章", exact: true }).click();
  await page.getByPlaceholder("搜索标题、标签和正文").fill("valarray");
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: /valarray/u })
      .first(),
  ).toBeVisible();
});
