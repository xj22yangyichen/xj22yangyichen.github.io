import { test, expect } from "@playwright/test";

test("only the first browser language determines the default", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "languages", {
      value: ["fr-FR", "zh-CN"],
    });
  });
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/$/);
});

test("Chinese browsers can explicitly open and select English", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/");
  await page.locator(".locale-switcher-trigger").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/$/);
});

for (const locale of ["zh-CN", "zh-TW", "zh-HK", "en-US", "ja-JP"]) {
  test.describe(locale, () => {
    test.use({ locale });
    test("home follows the browser's first language", async ({ page }) => {
      await page.goto("/?source=locale-test#home-title");
      const path = locale.startsWith("zh") ? "/" : "/en/";
      await expect(page).toHaveURL(
        new URL(`${path}?source=locale-test#home-title`, page.url()).href,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale.startsWith("zh") ? "zh-CN" : "en",
      );
    });
  });
}

test.describe("manual language selection", () => {
  test.use({ locale: "en-US" });

  test("remembers Chinese after switching, reload and a new visit", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/$/);
    await page.locator(".locale-switcher-trigger").click();
    await page.getByRole("option", { name: "简体中文", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  });

  test("explicit Chinese content links stay Chinese", async ({ page }) => {
    await page.goto("/posts/");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page).toHaveURL(/\/posts\/$/);
  });

  test("switching still works with blocked storage", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("Storage blocked");
        },
      });
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/$/);
    await page.locator(".locale-switcher-trigger").click();
    await page.getByRole("option", { name: "简体中文", exact: true }).click();
    await expect(page).toHaveURL(/\/\?lang=zh-CN$/);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  });
});
