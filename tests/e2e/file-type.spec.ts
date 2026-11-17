import { expect, test } from "@playwright/test";

test("detects file contents regardless of filename and clears results", async ({
  page,
}) => {
  await page.goto("/tools/");
  await page.getByRole("link", { name: "文件类型识别", exact: true }).click();
  const input = page.locator("#file-type-input");
  await input.setInputFiles({
    name: "wrong.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
  });
  await expect(page.getByRole("status")).toHaveText("识别类型: PDF");
  await expect(page.locator(".file-type-result")).toContainText(
    "application/pdf",
  );
  await expect(
    page.getByText("当前后缀与识别结果不一致，请参考建议后缀。", {
      exact: true,
    }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "no-extension",
    mimeType: "",
    buffer: Buffer.from("%PDF-1.7\n%%EOF"),
  });
  await expect(
    page.getByText("文件没有后缀，可以参考建议后缀。", { exact: true }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "empty",
    mimeType: "",
    buffer: Buffer.alloc(0),
  });
  await expect(page.getByRole("status")).toHaveText("空文件，无法判断类型");
  await page.getByRole("button", { name: "清空", exact: true }).click();
  await expect(page.locator(".file-type-result")).toHaveCount(0);
  await page.locator(".file-type-drop").evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["%PDF-1.7\n%%EOF"], "dropped.pdf"));
    element.dispatchEvent(
      new DragEvent("drop", { bubbles: true, dataTransfer: transfer }),
    );
  });
  await expect(page.getByRole("status")).toHaveText("识别类型: PDF");
  await expect(
    page.getByText("当前后缀与识别结果一致。", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/file-type-desktop.png",
    fullPage: true,
  });
  await page.goto("/en/tools/file-type/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "File type detector",
  );
  await page.setViewportSize({ width: 320, height: 800 });
  await input.setInputFiles({
    name: "unknown.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from([0, 1, 2, 3, 255]),
  });
  await expect(page.getByRole("status")).toHaveText("Unknown file type");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/file-type-mobile.png",
    fullPage: true,
  });
});
