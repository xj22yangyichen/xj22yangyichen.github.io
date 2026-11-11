import { expect, test, type Page } from "@playwright/test";

test.skip(
  process.env.PLAYWRIGHT_TEST_COMMENTS !== "1",
  "Build with PLAYWRIGHT_TEST_COMMENTS=1 for isolated Giscus tests.",
);

async function mockGiscus(page: Page, failFirst = false) {
  let attempts = 0;
  await page.route("https://giscus.app/client.js", async (route) => {
    if (failFirst && attempts++ === 0) return route.abort();
    await route.fulfill({
      contentType: "application/javascript",
      body: `
      (() => {
        const script = document.currentScript;
        const frame = document.createElement('iframe');
        frame.className = 'giscus-frame';
        frame.src = 'https://giscus.app/test-frame';
        frame.dataset.term = script.dataset.term;
        frame.dataset.lang = script.dataset.lang;
        script.parentElement.append(frame);
      })();
    `,
    });
  });
  await page.route("https://giscus.app/test-frame", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<html><body>Comments test fixture<script>
      window.addEventListener('message', event => {
        const theme = event.data?.giscus?.setConfig?.theme;
        if (theme) document.documentElement.dataset.theme = theme;
        parent.postMessage({giscus:{discussion:{url:'https://github.com/example/blog/discussions/123'}}}, '*');
      });
    </script></body></html>`,
    }),
  );
}

test("loads on demand, shares bilingual discussions, follows theme and resets on navigation", async ({
  page,
}) => {
  await mockGiscus(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/posts/chang-jian-de-luo-ji-miu-wu/");
  await expect(page.locator(".giscus-frame")).toHaveCount(0);
  const comments = page.getByTestId("article-comments");
  await comments.scrollIntoViewIfNeeded();
  await expect(comments).toHaveAttribute("data-status", "ready");
  await expect(page.locator(".giscus-frame")).toHaveAttribute(
    "data-term",
    "post:chang-jian-de-luo-ji-miu-wu",
  );
  await expect(
    page.frameLocator(".giscus-frame").locator("html"),
  ).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "切换主题" }).click();
  await expect(
    page.frameLocator(".giscus-frame").locator("html"),
  ).toHaveAttribute("data-theme", "dark");
  await expect(comments.getByRole("link")).toHaveAttribute(
    "href",
    "https://github.com/example/blog/discussions/123",
  );

  await page.goto("/en/posts/chang-jian-de-luo-ji-miu-wu/");
  await comments.scrollIntoViewIfNeeded();
  await expect(page.locator(".giscus-frame")).toHaveAttribute(
    "data-term",
    "post:chang-jian-de-luo-ji-miu-wu",
  );
  await expect(page.locator(".giscus-frame")).toHaveAttribute(
    "data-lang",
    "en",
  );

  await page.locator(".article-back-link").click();
  await page.locator('a[href="/en/posts/ru-he-commit/"]').first().click();
  await comments.scrollIntoViewIfNeeded();
  await expect(page.locator(".giscus-frame")).toHaveCount(1);
  await expect(page.locator(".giscus-frame")).toHaveAttribute(
    "data-term",
    "post:ru-he-commit",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("a failed script can be retried without losing the article", async ({
  page,
}) => {
  await mockGiscus(page, true);
  await page.goto("/posts/ru-he-commit/");
  const comments = page.getByTestId("article-comments");
  await comments.scrollIntoViewIfNeeded();
  await expect(comments).toHaveAttribute("data-status", "error");
  await expect(page.locator("h1")).toHaveText("如何 commit");
  await expect(comments.getByRole("link")).toHaveAttribute(
    "href",
    /discussions\?discussions_q=/,
  );
  await comments.getByRole("button", { name: "重新加载" }).click();
  await expect(comments).toHaveAttribute("data-status", "ready");
  await expect(page.locator(".giscus-frame")).toHaveCount(1);
});

test("a stalled embed times out while the article stays readable", async ({
  page,
}) => {
  await page.clock.install();
  await page.route("https://giscus.app/client.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "/* stalled embed */",
    }),
  );
  await page.goto("/posts/ru-he-commit/");
  const comments = page.getByTestId("article-comments");
  await comments.scrollIntoViewIfNeeded();
  await expect(comments).toHaveAttribute("data-status", "loading");
  await page.clock.fastForward(16_000);
  await expect(comments).toHaveAttribute("data-status", "error");
  await expect(page.locator("h1")).toHaveText("如何 commit");
});
