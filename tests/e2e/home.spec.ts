import { test, expect } from "@playwright/test";
test("personalized home, profile and mobile layout", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Yichen Yang 的博客");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "学习、代码与思考",
  );
  await expect(
    page.getByText("还没有文章，期待在第一篇记录中与你见面。"),
  ).toBeVisible();
  await expect(
    page.locator('a[href="https://github.com/xj22yangyichen"]').first(),
  ).toBeVisible();
  await expect(
    page.locator(
      'script[src*="googletagmanager"], script[src*="cloudflareinsights"], script[src*="googlesyndication"], script[src*="umami"]',
    ),
  ).toHaveCount(0);
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/about/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "关于 Yichen Yang",
  );
  await expect(
    page.getByText(/上海交通大学致远学院 ACM 班本科生/),
  ).toBeVisible();
});
test("empty sections and bilingual pages load", async ({ page }) => {
  for (const route of [
    "/posts/",
    "/books/",
    "/links/",
    "/archives/",
    "/en/",
    "/en/about/",
    "/en/posts/",
    "/en/books/",
    "/en/links/",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.locator('a[href*="chaosyn"], a[href*="example-user"]'),
    ).toHaveCount(0);
  }
});

test("empty search, mobile navigation and language switch work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "搜索文章", exact: true }).click();
  await page.getByPlaceholder("搜索标题、标签和正文").fill("学习");
  await expect(
    page.getByText("没有找到相关内容。", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭搜索", exact: true }).click();
  await page.getByRole("button", { name: "打开菜单", exact: true }).click();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "关于", exact: true })
    .click();
  await expect(page).toHaveURL(/\/about\/$/);
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "About Yichen Yang",
  );
});
