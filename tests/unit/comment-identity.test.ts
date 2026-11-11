import { describe, expect, it } from "vitest";
import { article } from "../fixtures/content";
import { validateCommentIdentities } from "@/lib/content/comment-identity";
import { includeEnglishArticles } from "@/lib/content/article-localization";

describe("article comment identities", () => {
  it("keeps the same discussion for English fallback and renamed translations", () => {
    const original = article({
      commentId: "permanent-id",
      translationKey: "pair",
    });
    expect(includeEnglishArticles([original])[1]?.commentId).toBe(
      "permanent-id",
    );
    expect(() =>
      validateCommentIdentities([
        original,
        article({
          locale: "en",
          slug: "renamed-translation",
          translationKey: "pair",
          commentId: "permanent-id",
        }),
      ]),
    ).not.toThrow();
  });

  it("rejects unrelated articles sharing a discussion", () => {
    expect(() =>
      validateCommentIdentities([
        article({ commentId: "same" }),
        article({ commentId: "same", slug: "other" }),
      ]),
    ).toThrow("already used");
  });

  it("rejects translations with different or missing discussion IDs", () => {
    for (const commentId of [undefined, "different"]) {
      expect(() =>
        validateCommentIdentities([
          article({ commentId: "original" }),
          article({ locale: "en", commentId }),
        ]),
      ).toThrow("translations must use the same commentId");
    }
  });
});
