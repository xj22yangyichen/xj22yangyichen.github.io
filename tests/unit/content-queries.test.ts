import { describe, expect, it } from "vitest";
import { articles, books } from "../fixtures/content";
import {
  findArticleTranslation,
  getArticleNavigation,
  getPublishedArticles,
  getPublishedArticlesByTag,
  getPublishedBooks,
  getTagSummaries,
  groupArticlesByYear,
} from "@/lib/content/queries";
describe("content queries", () => {
  it("orders published content, excludes drafts and separates languages", () => {
    expect(getPublishedArticles(articles, "zh-CN").map((a) => a.slug)).toEqual([
      "sample-post",
      "older-post",
    ]);
    expect(getPublishedArticles(articles, "en").map((a) => a.slug)).toEqual([
      "sample-english",
    ]);
    expect(getPublishedBooks(books, "zh-CN")).toHaveLength(1);
  });
  it("groups years and counts tags", () => {
    const published = getPublishedArticles(articles, "zh-CN");
    expect([...groupArticlesByYear(published).keys()]).toEqual([
      "2026",
      "2025",
    ]);
    expect(getTagSummaries(published)).toEqual([{ name: "学习", count: 2 }]);
    expect(getPublishedArticlesByTag(articles, "zh-CN", "学习")).toHaveLength(
      2,
    );
  });
  it("links translations and adjacent articles", () => {
    const first = articles[0]!;
    expect(findArticleTranslation(articles, first, "en")?.slug).toBe(
      "sample-english",
    );
    const navigation = getArticleNavigation(articles, first);
    expect([navigation.previous?.slug, navigation.next?.slug]).toContain(
      "older-post",
    );
  });
  it("supports an empty new blog", () => {
    expect(getPublishedArticles([], "zh-CN")).toEqual([]);
    expect(getPublishedBooks([], "zh-CN")).toEqual([]);
    expect(getTagSummaries([])).toEqual([]);
    expect(groupArticlesByYear([]).size).toBe(0);
  });
});
