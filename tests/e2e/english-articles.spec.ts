import { test, expect } from "@playwright/test";

test("English readers can browse Chinese articles with translated tags and a notice", async ({
  page,
}) => {
  await page.goto("/en/posts/");
  await expect(page.locator(".archive-row")).toHaveCount(7);
  await page.goto("/en/posts/cnblogs-17688982/");
  await expect(page.getByRole("note")).toContainText(
    "not available in English",
  );
  await expect(page.locator(".article-header-tags a")).toHaveText([
    "Mathematics",
    "Problem Solutions",
  ]);
  await expect(page.locator(".katex")).toHaveCount(9);
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "简体中文", exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/cnblogs-17688982\/$/);
  await expect(page.getByRole("note")).toHaveCount(0);
  await page.goto("/en/tags/Mathematics/");
  await expect(
    page.locator('a[href="/en/posts/cnblogs-17688982/"]').first(),
  ).toBeVisible();
});
