import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "reduce" }, colorScheme: "light" });

test("ASCII conversion, reverse, validation and clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/");
  await page.getByRole("link", { name: /ASCII 编码与解码/ }).click();
  const input = page.locator("#ascii-input");
  const output = page.locator("#ascii-output");
  await input.fill("Hello!");
  await page.getByRole("button", { name: "编码为 ASCII", exact: true }).click();
  await expect(output).toHaveValue("72 101 108 108 111 33");
  await page.getByRole("button", { name: "复制结果", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("已复制");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "72 101 108 108 111 33",
  );
  await page.getByRole("button", { name: "反向转换", exact: true }).click();
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(output).toHaveValue("Hello!");
  await input.fill("65, 66\n67");
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(output).toHaveValue("ABC");
  await input.fill("128");
  await expect(output).toHaveValue("");
  await page.getByRole("button", { name: "解码为文本", exact: true }).click();
  await expect(page.locator("#ascii-error")).toContainText("0–127");
  await page.getByRole("button", { name: "编码", exact: true }).click();
  await input.fill("你好");
  await page.getByRole("button", { name: "编码为 ASCII", exact: true }).click();
  await expect(page.locator("#ascii-error")).toContainText("非 ASCII 字符");
  await page.getByRole("button", { name: "试用示例", exact: true }).click();
  await page.getByRole("button", { name: "编码为 ASCII", exact: true }).click();
  await expect(output).toHaveValue(
    "72 101 108 108 111 44 32 87 111 114 108 100 33",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/ascii-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(output).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "编码为 ASCII", exact: true }),
  ).toBeDisabled();
});

test("ASCII mobile layout and English route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/ascii/");
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/tools\/ascii\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "ASCII encoder & decoder",
  );
  await page.getByRole("button", { name: "Decode", exact: true }).click();
  await page
    .getByRole("button", { name: "Try an example", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Decode to text", exact: true })
    .click();
  await expect(page.locator("#ascii-output")).toHaveValue("Hello, World!");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(21, 24, 23)",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/ascii-mobile.png",
    fullPage: true,
  });
});
