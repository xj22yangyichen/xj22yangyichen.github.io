import { expect, test } from "@playwright/test";

test("article reads load on navigation and reset between articles", async ({
  page,
}) => {
  let requests = 0;
  await page.route("https://busuanzi.ibruce.info/busuanzi?*", async (route) => {
    requests++;
    const callback = new URL(route.request().url()).searchParams.get(
      "jsonpCallback",
    );
    await route.fulfill({
      contentType: "application/javascript",
      body: `${callback}({page_pv: ${requests === 1 ? 1234 : 0}});`,
    });
  });
  await page.goto("/posts/");
  expect(requests).toBe(0);
  await page.locator('a[href="/posts/ru-he-commit/"]').first().click();
  await expect(page.getByTestId("article-view-stats")).toHaveText(
    "阅读量 1,234",
  );
  expect(requests).toBe(1);
  await page.locator(".article-back-link").click();
  await page
    .locator(
      'a[href="/posts/poj2411-mondriaans-dream-duo-mi-nuo-mi-pu-wen-ti/"]',
    )
    .first()
    .click();
  await expect(page.getByTestId("article-view-stats")).toHaveText("阅读量 0");
  expect(requests).toBe(2);
});

test("failed statistics do not interrupt reading", async ({ page }) => {
  await page.route("https://busuanzi.ibruce.info/busuanzi?*", (route) =>
    route.abort(),
  );
  await page.goto("/posts/ru-he-commit/");
  await expect(page.getByTestId("article-view-stats")).toHaveText("阅读量 —");
  await expect(page.locator(".article-prose")).toBeVisible();
});

test("English article view counts are localized", async ({ page }) => {
  await page.route("https://busuanzi.ibruce.info/busuanzi?*", async (route) => {
    const callback = new URL(route.request().url()).searchParams.get(
      "jsonpCallback",
    );
    await route.fulfill({
      contentType: "application/javascript",
      body: `${callback}({page_pv: 42});`,
    });
  });
  await page.goto("/en/posts/ru-he-commit/");
  await expect(page.getByTestId("article-view-stats")).toHaveText("Views 42");
});
