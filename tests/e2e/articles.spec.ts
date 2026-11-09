import { test, expect } from "@playwright/test";
import { loadArticles } from "../../lib/content/reader";

test("published articles display their titles, tags, timestamps and code", async ({
  page,
}) => {
  await page.goto("/posts/");
  const articles = (await loadArticles()).filter(
    (article) => !article.draft && article.locale === "zh-CN",
  );
  await expect(page.locator(".archive-row")).toHaveCount(articles.length);
  for (const record of articles) {
    await page.goto(`/posts/${record.slug}/`);
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
      (record.body.match(/^```/gm)?.length ?? 0) / 2,
    );
  }
});

test("C++ code highlighting follows the blog theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/posts/poj2411-mondriaans-dream-duo-mi-nuo-mi-pu-wen-ti/");

  const block = page.locator(".article-prose pre");
  const code = block.locator("code.hljs.language-cpp");
  const keyword = code.locator(".hljs-keyword").filter({ hasText: /^while$/u });
  const string = code.locator(".hljs-string").filter({ hasText: /^"%d%d"$/u });

  await expect(code).toContainText("#include<math.h>");
  await expect(block).toHaveCSS("background-color", "rgb(245, 245, 245)");
  await expect(keyword).toHaveCSS("color", "rgb(0, 0, 204)");
  await expect(string).toHaveCSS("color", "rgb(163, 21, 21)");

  await page.getByRole("button", { name: "切换主题" }).click();
  await expect(block).toHaveCSS("background-color", "rgb(30, 30, 30)");
  await expect(keyword).toHaveCSS("color", "rgb(86, 156, 214)");
  await expect(string).toHaveCSS("color", "rgb(214, 157, 133)");
});

test("formulas, tables, tag browsing and search results work", async ({
  page,
}) => {
  await page.goto("/posts/poj2411-mondriaans-dream-duo-mi-nuo-mi-pu-wen-ti/");
  await expect(page.locator(".katex")).toHaveCount(9);
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/article-math-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/article-math-mobile.png",
    fullPage: true,
  });
  await page.goto("/posts/ru-he-commit/");
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
