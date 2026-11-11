import { ContentValidationError } from "@/lib/content/errors";
import type { Article } from "@/lib/content/types";

/** Only translations of the same article may share a discussion. */
export function validateCommentIdentities(articles: readonly Article[]): void {
  const byId = new Map<string, Article[]>();
  for (const article of articles) {
    if (!article.commentId) continue;
    const group = byId.get(article.commentId) ?? [];
    for (const other of group) {
      const translations =
        article.locale !== other.locale &&
        (article.slug === other.slug ||
          (article.translationKey &&
            article.translationKey === other.translationKey));
      if (!translations) {
        throw new ContentValidationError(
          article.sourcePath,
          `commentId ${article.commentId} is already used by ${other.sourcePath}`,
        );
      }
    }
    group.push(article);
    byId.set(article.commentId, group);
  }
  for (const article of articles) {
    const translation = articles.find(
      (other) =>
        other.locale !== article.locale &&
        (other.slug === article.slug ||
          (article.translationKey &&
            other.translationKey === article.translationKey)),
    );
    if (translation && article.commentId !== translation.commentId) {
      throw new ContentValidationError(
        article.sourcePath,
        "translations must use the same commentId",
      );
    }
  }
}
