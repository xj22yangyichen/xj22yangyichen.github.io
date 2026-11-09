import { describe, expect, it } from "vitest";
import { article } from "../fixtures/content";
import {
  includeEnglishArticles,
  englishArticleTags,
} from "@/lib/content/article-localization";
import { loadSiteArticles } from "@/lib/content/reader";
import { buildContentLocaleRoutes } from "@/lib/content/locale-routes";
import { buildSearchDocuments } from "@/lib/search/index";
import {
  getPublishedArticles,
  getPublishedArticlesByTag,
} from "@/lib/content/queries";

describe("English article fallback", () => {
  it("shares Chinese text, translates tags and connects language routes", () => {
    const original = article({ tags: ["数学", "题解", "STL"] });
    const result = includeEnglishArticles([original]);
    expect(result[1]).toMatchObject({
      body: original.body,
      title: original.title,
      locale: "en",
      contentLocale: "zh-CN",
      tags: ["Mathematics", "Problem Solutions", "STL"],
    });
    expect(original.tags).toEqual(["数学", "题解", "STL"]);
    const routes = buildContentLocaleRoutes(result, []);
    expect(routes["/posts/sample-post/"]).toBe("/en/posts/sample-post/");
    expect(routes["/en/posts/sample-post/"]).toBe("/posts/sample-post/");
    expect(getPublishedArticlesByTag(result, "en", "Mathematics")).toHaveLength(
      1,
    );
    expect(buildSearchDocuments(result, "en")[0]?.href).toBe(
      "/en/posts/sample-post/",
    );
  });

  it("prefers published English translations and excludes Chinese drafts", () => {
    const original = article({ translationKey: "paired" });
    const translated = article({
      locale: "en",
      slug: "english",
      translationKey: "paired",
    });
    expect(
      includeEnglishArticles([original, translated, article({ draft: true })]),
    ).toHaveLength(3);
    const fallback = includeEnglishArticles([
      original,
      { ...translated, draft: true },
    ]);
    expect(getPublishedArticles(fallback, "en")[0]?.contentLocale).toBe(
      "zh-CN",
    );
  });

  it("includes all published repository articles with English tags", async () => {
    const articles = await loadSiteArticles();
    const chinese = getPublishedArticles(articles, "zh-CN");
    expect(getPublishedArticles(articles, "en")).toHaveLength(chinese.length);
    for (const source of chinese) {
      for (const tag of source.tags) {
        if (/\p{Script=Han}/u.test(tag))
          expect(englishArticleTags[tag]).toBeTruthy();
      }
      expect(
        getPublishedArticles(articles, "en").find(
          (item) => item.slug === source.slug,
        )?.body,
      ).toBe(source.body);
    }
  });
});
