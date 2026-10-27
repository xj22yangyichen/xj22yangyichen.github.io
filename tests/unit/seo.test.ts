import { describe, expect, it } from "vitest";
import { article, articles, books } from "../fixtures/content";
import { serializeJsonLd } from "@/components/seo/json-ld";
import {
  buildArticleMetadata,
  buildArticleStructuredData,
} from "@/lib/seo/content-metadata";
import { buildRssFeed } from "@/lib/seo/rss";
import { buildSitemap } from "@/lib/seo/sitemap";
describe("SEO output", () => {
  it("excludes drafts from RSS and emits valid empty feeds", () => {
    const feed = buildRssFeed(articles, "zh-CN");
    expect(feed).toContain("sample-post");
    expect(feed).not.toContain("draft-post");
    expect(buildRssFeed([], "en")).toContain("<language>en</language>");
  });
  it("keeps translated and empty sitemap routes valid", () => {
    const sitemap = buildSitemap({ articles, books });
    expect(sitemap.some((e) => e.url.includes("draft-post"))).toBe(false);
    expect(
      sitemap.find((e) => e.url.endsWith("/posts/sample-post/"))?.alternates
        ?.languages,
    ).toMatchObject({
      en: expect.stringContaining("/en/posts/sample-english/"),
    });
    expect(
      buildSitemap({ articles: [], books: [] }).some((e) =>
        e.url.endsWith("/en/books/"),
      ),
    ).toBe(false);
  });
  it("builds safe article metadata and structured data", () => {
    const sample = article();
    expect(buildArticleMetadata(sample, null).openGraph).toMatchObject({
      type: "article",
    });
    expect(buildArticleStructuredData(sample).author).toMatchObject({
      name: "Yichen Yang",
    });
    expect(serializeJsonLd({ title: "</script>" })).not.toContain("<");
  });
});
