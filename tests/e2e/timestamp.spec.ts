import { expect, test } from "@playwright/test";

test("timestamp toolbox conversion, validation and reverse conversion", async ({
  page,
}) => {
  await page.goto("/tools/");
  await page.getByRole("link", { name: /Unix 时间戳转换/ }).click();
  await page.getByLabel("日期时区").selectOption("utc");
  const input = page.locator("#timestamp-input");
  const output = page.locator("#timestamp-output");
  await input.fill("-0.001");
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(output).toHaveValue("1969-12-31 23:59:59.999");
  await page.getByRole("button", { name: "反向转换" }).click();
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(output).toHaveValue("-0.001");
  await page.getByLabel("时间戳单位").selectOption("milliseconds");
  await expect(output).toHaveValue("");
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(output).toHaveValue("-1");
  await input.fill("2026-02-30 12:00");
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(page.locator("#timestamp-error")).toBeVisible();
  await page.getByRole("button", { name: "使用当前时间" }).click();
  await page.getByRole("button", { name: "转换", exact: true }).click();
  await expect(output).toHaveValue(/^[0-9]+$/);
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(output).toHaveValue("");
});

test("English timestamp page fits mobile and supports Beijing time", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/en/tools/timestamp/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Unix timestamp converter",
  );
  await page.getByLabel("Date time zone").selectOption("beijing");
  await page.locator("#timestamp-input").fill("0");
  await page.getByRole("button", { name: "Convert", exact: true }).click();
  await expect(page.locator("#timestamp-output")).toHaveValue(
    "1970-01-01 08:00:00.000",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
