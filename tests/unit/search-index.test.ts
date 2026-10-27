import { describe, expect, it } from "vitest";
import { articles } from "../fixtures/content";
import { buildSearchDocuments, createSearchIndex } from "@/lib/search/index";
import { searchQueryOptions, tokenizeSearchText } from "@/lib/search/config";
describe("search index", () => {
  it("tokenizes Chinese and English", () => {
    expect(tokenizeSearchText("博客 Search 设计")).toEqual([
      "博",
      "客",
      "search",
      "设",
      "计",
    ]);
  });
  it("excludes drafts and other languages", () => {
    expect(buildSearchDocuments(articles, "zh-CN")).toHaveLength(2);
    expect(buildSearchDocuments(articles, "en")).toHaveLength(1);
  });
  it("finds titles and supports an empty index", () => {
    expect(
      createSearchIndex(buildSearchDocuments(articles, "en")).search(
        "Learning",
        searchQueryOptions,
      )[0]?.href,
    ).toBe("/en/posts/sample-english/");
    expect(
      createSearchIndex([]).search("Learning", searchQueryOptions),
    ).toEqual([]);
  });
});
