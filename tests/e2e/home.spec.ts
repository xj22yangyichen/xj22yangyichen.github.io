import { test, expect } from "@playwright/test";
test("personalized home, profile and mobile layout", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Yichen Yang 的博客");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "学习、代码与思考",
  );
  await expect(
    page.getByRole("link", { name: "如何 commit", exact: true }),
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
test("sections and bilingual pages load", async ({ page }) => {
  for (const route of [
    "/posts/",
    "/links/",
    "/en/",
    "/en/about/",
    "/en/posts/",
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

test("merged article index preserves its heading and archive layout", async ({
  page,
}) => {
  for (const [path, title, topics] of [
    ["/posts/", "所有文章", "全部主题"],
    ["/en/posts/", "All writing", "All topics"],
  ]) {
    await page.goto(path!);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title!);
    await expect(
      page.getByRole("heading", { level: 2, name: topics! }),
    ).toBeVisible();
    await expect(page.locator(".archive-layout")).toBeVisible();
    await expect(page.locator('nav a[href$="/archives/"]')).toHaveCount(0);
  }
  for (const [source, target] of [
    ["/archives/", "/posts/"],
    ["/en/archives/", "/en/posts/"],
  ]) {
    await page.goto(source!);
    await expect(page).toHaveURL(new URL(target!, page.url()).href);
  }
  await page.goto("/posts/");
  await page.screenshot({
    path: "test-results/posts-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/posts-mobile.png",
    fullPage: true,
  });
});

test("empty search, mobile navigation and language switch work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "搜索文章", exact: true }).click();
  await page
    .getByPlaceholder("搜索标题、标签和正文")
    .fill("no-such-post-8675309");
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
