import { expect, test } from "@playwright/test";

test("linear solver navigation, solutions, validation and actions", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/");
  await page.getByRole("link", { name: "线性方程组求解" }).click();
  await page.getByRole("button", { name: "试用示例" }).click();
  const calculate = page.getByRole("button", { name: "计算", exact: true });
  const output = page.locator("#matrix-output");
  await calculate.click();
  await expect(output).toHaveValue("唯一解\nx1 = 1\nx2 = 2");
  await page.getByRole("button", { name: "复制结果" }).click();
  await expect(page.getByRole("status")).toHaveText("已复制");
  expect(
    (await page.evaluate(() => navigator.clipboard.readText())).replace(
      /\r\n/g,
      "\n",
    ),
  ).toBe("唯一解\nx1 = 1\nx2 = 2");
  await page.locator("#matrix-a").fill("1 1\n2 2");
  await expect(output).toHaveValue("");
  await page.locator("#matrix-b").fill("1\n3");
  await calculate.click();
  await expect(output).toHaveValue("无解。");
  await page.locator("#matrix-b").fill("1\n2");
  await calculate.click();
  await expect(output).toHaveValue(/无穷多解/);
  await page.locator("#matrix-b").fill("1 2");
  await calculate.click();
  await expect(page.locator("#matrix-error")).toContainText("常数列 b");
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(calculate).toBeDisabled();
});

test("English solver supports mobile and precision changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/en/tools/linear-equations/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Linear equation solver",
  );
  await page.locator("#matrix-a").fill("3");
  await page.locator("#matrix-b").fill("1");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator("#matrix-output")).toHaveValue(
    "Unique solution\nx1 = 0.3333",
  );
  await page.getByLabel("Decimal places").selectOption("10");
  await expect(page.locator("#matrix-output")).toHaveValue(
    "Unique solution\nx1 = 0.3333333333",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
