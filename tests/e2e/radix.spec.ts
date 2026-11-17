import { expect, test } from "@playwright/test";

test("base conversion, reverse, validation, copying and mobile layout", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/tools/");
  await page.getByRole("link", { name: "进制转换", exact: true }).click();
  await page.getByRole("button", { name: "试用示例" }).click();
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(page.locator("#radix-output")).toHaveValue("FF.8");
  await page.getByRole("button", { name: "复制结果" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "FF.8",
  );
  await page.getByRole("button", { name: "反向转换" }).click();
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(page.locator("#radix-output")).toHaveValue("255.5");
  await page.getByLabel("输入进制").selectOption("2");
  await expect(page.locator("#radix-output")).toHaveValue("");
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(page.locator("#radix-error")).toContainText("不匹配");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "转换", exact: true }),
  ).toBeDisabled();
});

test("English page and approximate fractional result", async ({ page }) => {
  await page.goto("/en/tools/radix/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Number base converter",
  );
  await page.getByLabel("Output base").selectOption("2");
  await page.getByLabel("Input number").fill("0.1");
  await page.getByRole("button", { name: "Convert", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("approximation");
  await expect(
    page.getByRole("button", { name: "Reverse conversion" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Swap bases" }).click();
  await expect(page.getByLabel("Input base")).toHaveValue("2");
  await expect(page.getByLabel("Output base")).toHaveValue("10");
  await expect(page.locator("#radix-output")).toHaveValue("");
});
