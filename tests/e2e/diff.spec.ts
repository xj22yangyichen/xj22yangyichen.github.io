import { expect, test } from "@playwright/test";
test.use({ contextOptions: { reducedMotion: "reduce" }, colorScheme: "light" });

test("diff alignment, inline highlights, swapping and stale result clearing", async ({
  page,
}) => {
  await page.goto("/tools/");
  await page.getByRole("link", { name: /文本对比/ }).click();
  const before = page.getByLabel("原始文本", { exact: true });
  const after = page.getByLabel("修改后文本", { exact: true });
  const compare = page.getByRole("button", { name: "对比文本", exact: true });
  await expect(compare).toBeDisabled();
  await before.fill("const count = 10;\nkeep\n");
  await after.fill("const count = 20;\nadded\nkeep\n");
  await compare.click();
  await expect(page.locator(".diff-summary")).toHaveText("+2 -1");
  await expect(page.locator(".diff-before mark").first()).toHaveText("1");
  await expect(page.locator(".diff-after mark").first()).toHaveText("2");
  await expect(page.locator(".diff-row-same")).toContainText("keep");
  await expect(page.locator(".diff-empty")).toHaveCount(1);
  await page.getByRole("button", { name: "交换两侧", exact: true }).click();
  await expect(page.locator(".diff-results")).toHaveCount(0);
  await compare.click();
  await expect(page.locator(".diff-summary")).toHaveText("+1 -2");
  await after.fill("changed");
  await expect(page.locator(".diff-results")).toHaveCount(0);
  await before.fill("same");
  await after.fill("same");
  await compare.click();
  await expect(page.locator(".diff-summary")).toHaveText("两段文本一致");
  await after.fill("same\n");
  await compare.click();
  await expect(page.locator(".diff-ending-changed")).toHaveCount(2);
  await page.getByRole("button", { name: "试用示例", exact: true }).click();
  await compare.click();
  await expect(page.locator(".diff-summary")).toHaveText("+3 -2");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/diff-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(before).toHaveValue("");
  await expect(after).toHaveValue("");
  await expect(page.locator(".diff-results")).toHaveCount(0);
});

test("one-sided input, literal HTML and mobile English dark view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/diff/");
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/tools\/diff\/$/);
  await page
    .getByLabel("Modified text", { exact: true })
    .fill('<img src=x onerror="alert(1)">\n');
  await page
    .getByRole("button", { name: "Compare texts", exact: true })
    .click();
  await expect(page.locator(".diff-summary")).toHaveText("+1 -0");
  await expect(page.locator(".diff-line-text")).toHaveText(
    '<img src=x onerror="alert(1)">',
  );
  await expect(page.locator(".diff-results img")).toHaveCount(0);
  await page.getByRole("button", { name: "Swap sides", exact: true }).click();
  await page
    .getByRole("button", { name: "Compare texts", exact: true })
    .click();
  await expect(page.locator(".diff-summary")).toHaveText("+0 -1");
  await page
    .getByRole("button", { name: "Try an example", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare texts", exact: true })
    .click();
  await expect(page.locator(".diff-row-same .diff-after")).toBeHidden();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(21, 24, 23)",
  );
  await page.screenshot({
    path: "test-results/diff-mobile.png",
    fullPage: true,
  });
  await page
    .getByLabel("Modified text", { exact: true })
    .fill("x".repeat(1500));
  await page
    .getByRole("button", { name: "Compare texts", exact: true })
    .click();
  await expect(page.locator(".diff-results")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".diff-scroll")
      .evaluate((node) => node.scrollWidth > node.clientWidth),
  ).toBe(true);
});
