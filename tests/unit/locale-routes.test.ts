import { describe, expect, it } from "vitest";
import { articles, books } from "../fixtures/content";
import { buildContentLocaleRoutes } from "@/lib/content/locale-routes";
import { getLocaleSwitchPath } from "@/lib/i18n";
describe("content locale routes", () => {
  it("maps translations in both directions", () => {
    const routes = buildContentLocaleRoutes(articles, books);
    expect(routes["/posts/sample-post/"]).toBe("/en/posts/sample-english/");
    expect(routes["/en/posts/sample-english/"]).toBe("/posts/sample-post/");
  });
  it("handles an empty blog and untranslated content", () => {
    expect(buildContentLocaleRoutes([], [])).toEqual({});
    const routes = buildContentLocaleRoutes(articles, books);
    expect(routes["/books/sample-book/"]).toBe("/en/");
    expect(getLocaleSwitchPath("/posts/unknown/", "en", routes)).toBe("/en/");
  });
});
