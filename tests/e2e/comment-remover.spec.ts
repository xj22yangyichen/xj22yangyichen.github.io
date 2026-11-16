import { expect, test } from "@playwright/test";

test("comment remover supports all languages, copying, reset and mobile English", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/");
  await page.getByRole("link", { name: "删除代码注释", exact: true }).click();
  const language = page.getByLabel("代码语言");
  const input = page.getByLabel("输入代码", { exact: true });
  const output = page.getByLabel("处理结果", { exact: true });
  for (const value of [
    "cpp",
    "rust",
    "python",
    "go",
    "java",
    "javascript",
    "php",
  ]) {
    await language.selectOption(value);
    await expect(output).toHaveValue("");
    const code =
      value === "python" ? 'x = "# keep" # remove' : 'x = "// keep"; // remove';
    const result = value === "python" ? 'x = "# keep" ' : 'x = "// keep"; ';
    await input.fill(code);
    await page.getByRole("button", { name: "删除注释", exact: true }).click();
    await expect(output).toHaveValue(result);
    await page.getByRole("button", { name: "复制结果", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("已复制");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      result,
    );
  }
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(output).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "删除注释", exact: true }),
  ).toBeDisabled();
  await language.selectOption("custom");
  const line = page.getByLabel("单行注释开始符", { exact: true });
  const start = page.getByLabel("多行注释开始符", { exact: true });
  const end = page.getByLabel("多行注释结束符", { exact: true });
  for (const field of [line, start, end]) {
    await expect(field).toBeVisible();
    const size = await field.boundingBox();
    const selectSize = await language.boundingBox();
    expect(size!.width).toBe(selectSize!.width);
    expect(size!.height).toBe(selectSize!.height);
  }
  await line.fill("--");
  await start.fill("(*");
  await end.fill("*)");
  await input.fill('x(* note *)y -- end\n"-- keep"');
  await page.getByRole("button", { name: "删除注释", exact: true }).click();
  await expect(output).toHaveValue('x y \n"-- keep"');
  await end.fill("");
  await expect(output).toHaveValue("");
  await expect(
    page.locator(".comment-workbench").getByRole("alert"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "删除注释", exact: true }),
  ).toBeDisabled();
  await language.selectOption("java");
  await expect(line).toHaveCount(0);
  await language.selectOption("custom");
  await expect(line).toHaveValue("--");
  await page.goto("/en/tools/comment-remover/");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Code comment remover",
  );
  await page.getByLabel("Code language").selectOption("rust");
  await page
    .getByRole("button", { name: "Try an example", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove comments", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    '\nlet url = r#"https://example.com"#;\n \nlet total = 3;\n',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Code language").selectOption("custom");
  await expect(
    page.getByLabel("Block comment end", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
