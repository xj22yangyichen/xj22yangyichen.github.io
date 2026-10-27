import { describe, expect, it } from "vitest";
import {
  getLocalizedSiteConfig,
  resolveSiteUrl,
  siteConfig,
  supportedLocales,
} from "@/lib/site-config";
describe("personal blog configuration", () => {
  it("uses the owner's bilingual identity and GitHub profile", () => {
    expect(supportedLocales).toContain(siteConfig.defaultLocale);
    for (const locale of supportedLocales)
      expect(getLocalizedSiteConfig(locale).authorName).toBe("Yichen Yang");
    expect(siteConfig.socialLinks.map((link) => link.href)).toEqual([
      "https://github.com/xj22yangyichen",
    ]);
    expect(siteConfig.profileStatus.github.username).toBe("xj22yangyichen");
  });
  it("disables unconfigured integrations and removes account IDs", () => {
    expect(siteConfig.integrations.aiSearch.enabled).toBe(false);
    expect(siteConfig.integrations.analytics.enabled).toBe(false);
    expect(siteConfig.integrations.analytics.websiteId).toBe("");
    expect(siteConfig.integrations.comments.repo).toBe("");
    expect(siteConfig.integrations.sponsorship.qrCodeSrc).toBe("");
    expect(siteConfig.integrations.googleAnalytics.measurementId).toBe("");
    expect(siteConfig.integrations.cloudflareWebAnalytics.token).toBe("");
    expect(siteConfig.integrations.advertising.adsenseClientId).toBe("");
    for (const placement of Object.values(
      siteConfig.integrations.advertising.placements,
    ))
      expect(placement.enabled).toBe(false);
  });
  it("rejects unsafe site URL protocols", () => {
    expect(() => resolveSiteUrl("file:///tmp/blog")).toThrow();
  });
});
