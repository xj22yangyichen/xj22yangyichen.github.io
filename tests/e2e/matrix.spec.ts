import { expect, test } from "@playwright/test";

test("matrix toolbox calculations, validation and copying", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/");
  await page.getByRole("link", { name: /矩阵乘法/ }).click();
  await page.locator("#matrix-a").fill("1, 2, 3\n4 5 6");
  await page.locator("#matrix-b").fill("7 8\n9 10\n11 12");
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator("#matrix-output")).toHaveValue("58 64\n139 154");
  await page.getByRole("button", { name: "复制结果" }).click();
  await expect(page.getByRole("status")).toHaveText("已复制");
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.replace(/\r\n/g, "\n")).toBe("58 64\n139 154");
  await page.locator("#matrix-b").fill("1 2");
  await expect(page.locator("#matrix-output")).toHaveValue("");
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator("#matrix-error")).toContainText("矩阵 A 的列数");
  await page.getByRole("link", { name: "全部工具" }).click();
  await page.getByRole("link", { name: /求矩阵特征值/ }).click();
  await page.getByRole("button", { name: "试用示例" }).click();
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator("#matrix-output")).toHaveValue("0 + 1i\n0 - 1i");
  await page.getByRole("link", { name: "全部工具" }).click();
  await page.getByRole("link", { name: /矩阵求逆/ }).click();
  await page.locator("#matrix-a").fill("1 2\n2 4");
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator("#matrix-error")).toContainText("矩阵不可逆");
  await page.getByRole("button", { name: "试用示例" }).click();
  await page.getByRole("button", { name: "计算", exact: true }).click();
  await expect(page.locator("#matrix-output")).toHaveValue("-2 1\n1.5 -0.5");
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(page.locator("#matrix-a")).toHaveValue("");
  await expect(page.locator("#matrix-output")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "计算", exact: true }),
  ).toBeDisabled();
});

test("English matrix pages fit mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const slug of [
    "matrix-multiply",
    "matrix-eigenvalues",
    "matrix-inverse",
  ]) {
    await page.goto(`/en/tools/${slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Matrix",
    );
    await page.getByRole("button", { name: "Try an example" }).click();
    await expect(
      page.getByRole("combobox", { name: "Decimal places" }),
    ).toHaveValue("4");
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    await expect(page.locator("#matrix-output")).not.toHaveValue("");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("decimal precision updates existing results without losing digits", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const slug of [
    "matrix-multiply",
    "matrix-eigenvalues",
    "matrix-inverse",
  ]) {
    await page.goto(`/tools/${slug}/`);
    const precision = page.getByRole("combobox", { name: "小数位数" });
    await expect(precision).toHaveValue("4");
    await expect(precision.locator("option")).toHaveCount(11);
    await page
      .locator("#matrix-a")
      .fill(slug === "matrix-inverse" ? "3" : "0.3333333333333333");
    if (slug === "matrix-multiply") await page.locator("#matrix-b").fill("1");
    await page.getByRole("button", { name: "计算", exact: true }).click();
    await expect(page.locator("#matrix-output")).toHaveValue("0.3333");
    await precision.selectOption("0");
    await expect(page.locator("#matrix-output")).toHaveValue("0");
    await precision.selectOption("10");
    await expect(page.locator("#matrix-output")).toHaveValue("0.3333333333");
    await precision.selectOption("2");
    await page.getByRole("button", { name: "复制结果" }).click();
    await expect(page.getByRole("status")).toHaveText("已复制");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "0.33",
    );
    await page
      .locator("#matrix-a")
      .fill(slug === "matrix-inverse" ? "0.5" : "2");
    await expect(page.locator("#matrix-output")).toHaveValue("");
    await page.getByRole("button", { name: "计算", exact: true }).click();
    await expect(page.locator("#matrix-output")).toHaveValue("2");
  }
});
