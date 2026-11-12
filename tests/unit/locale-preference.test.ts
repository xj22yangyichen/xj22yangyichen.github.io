import { describe, expect, it } from "vitest";

import { getPreferredLocale } from "@/lib/locale-preference";

describe("browser language preference", () => {
  it.each([
    "zh",
    "zh-CN",
    "zh-TW",
    "zh-HK",
    "zh-SG",
    "zh-Hans",
    "zh-Hant-TW",
    "ZH-mo",
  ])("uses Chinese for %s", (language) =>
    expect(getPreferredLocale(language, null)).toBe("zh-CN"),
  );

  it.each(["en-US", "ja", "fr-FR", "de", ""])(
    "uses English for %s",
    (language) => expect(getPreferredLocale(language, null)).toBe("en"),
  );

  it("respects manual choices and ignores invalid saved values", () => {
    expect(getPreferredLocale("en-US", "zh-CN")).toBe("zh-CN");
    expect(getPreferredLocale("zh-TW", "en")).toBe("en");
    expect(getPreferredLocale("ja", "invalid")).toBe("en");
  });
});
