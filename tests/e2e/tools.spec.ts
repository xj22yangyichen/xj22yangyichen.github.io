import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" }, colorScheme: "light" });

test("toolbox navigation, Unicode conversion, copying and invalid input", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("工具箱");
  await page.screenshot({
    path: "test-results/toolbox-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: /Base64 编码与解码/ }).click();
  const input = page.locator("#base64-input");
  const output = page.locator("#base64-output");
  await expect(
    page.locator('.desktop-navigation a[aria-current="page"]'),
  ).toHaveText("工具箱");
  await input.fill("你好 👋");
  await page
    .getByRole("button", { name: "编码为 Base64", exact: true })
    .click();
  await expect(output).toHaveValue("5L2g5aW9IPCfkYs=");
  await page.getByRole("button", { name: "复制结果", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("已复制");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "5L2g5aW9IPCfkYs=",
  );
  await page.getByRole("button", { name: "反向转换", exact: true }).click();
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(output).toHaveValue("你好 👋");
  await input.fill("@@@");
  await expect(output).toHaveValue("");
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(page.locator("#base64-error")).toContainText(
    "Base64 格式不正确",
  );
  await input.fill("/w==");
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(page.locator("#base64-error")).toContainText("不是有效的 UTF-8");
  await page.getByRole("button", { name: "试用示例", exact: true }).click();
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(output).toHaveValue("Hello, 世界! 👋");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/tools-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(output).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "解码为文本", exact: true }),
  ).toBeDisabled();
});

test("mobile navigation, language switching and dark theme", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "打开菜单", exact: true }).click();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "工具箱", exact: true })
    .click();
  await page.getByRole("link", { name: /Base64 编码与解码/ }).click();
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/tools\/base64\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Base64 encoder & decoder",
  );
  await page
    .getByRole("button", { name: "Try an example", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Encode to Base64", exact: true })
    .click();
  await expect(page.locator("#base64-output")).not.toHaveValue("");
  for (const width of [320, 390, 768, 1024, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width > 1020) {
      const brand = await page.locator(".site-brand").boundingBox();
      const navigation = await page
        .locator(".desktop-navigation")
        .boundingBox();
      const actions = await page.locator(".header-actions").boundingBox();
      expect(brand!.x + brand!.width).toBeLessThanOrEqual(navigation!.x);
      expect(navigation!.x + navigation!.width).toBeLessThanOrEqual(actions!.x);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/tools-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(21, 24, 23)",
  );
  await page.screenshot({
    path: "test-results/tools-dark.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "All tools", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tools");
});
