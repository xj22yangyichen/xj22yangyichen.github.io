import { expect, test } from "@playwright/test";

test("primality navigation, exact input, boundaries and reset", async ({
  page,
}) => {
  await page.goto("/tools/");
  await page.getByRole("link", { name: /质数判断/ }).click();
  const input = page.locator("#integer-input");
  const output = page.locator("#integer-output");
  const calculate = page.getByRole("button", { name: "判断质数", exact: true });
  for (const [value, expected] of [
    ["1152921504606846883", "1152921504606846883 是质数。"],
    ["9007199254740993", "9007199254740993 是合数。"],
    ["1152921504606846976", "1152921504606846976 是合数。"],
    ["1", "1 既不是质数，也不是合数。"],
  ]) {
    await input.fill(value!);
    await calculate.click();
    await expect(output).toHaveValue(expected!);
  }
  await input.fill("1152921504606846977");
  await expect(output).toHaveValue("");
  await calculate.click();
  await expect(page.locator("#integer-error")).toContainText("不能超过");
  await input.fill("1e18");
  await calculate.click();
  await expect(page.locator("#integer-error")).toContainText("仅由数字");
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(calculate).toBeDisabled();
});

test("factorization, copying, language switching and mobile layout", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/tools/");
  await page.getByRole("link", { name: /质因数分解/ }).click();
  await page.getByRole("button", { name: "试用示例", exact: true }).click();
  await page.getByRole("button", { name: "分解质因数", exact: true }).click();
  const expected = "1000000016000000063 = 1000000007 × 1000000009";
  await expect(page.locator("#integer-output")).toHaveValue(expected);
  await page.getByRole("button", { name: "复制结果", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("已复制");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    expected,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.locator("#integer-input").fill("0");
  await page.getByRole("button", { name: "分解质因数", exact: true }).click();
  await expect(page.locator("#integer-error")).toContainText("没有质因数分解");
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/tools\/prime-factorization\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Prime factorization",
  );
  await page.locator("#integer-input").fill("1152921504606846976");
  await page
    .getByRole("button", { name: "Factor into primes", exact: true })
    .click();
  await expect(page.locator("#integer-output")).toHaveValue(
    "1152921504606846976 = 2^60",
  );
});
