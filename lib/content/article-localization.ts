import type { Article } from "@/lib/content/types";

export const englishArticleTags: Readonly<Record<string, string>> = {
  常数优化: "Constant-factor Optimization",
  逻辑学: "Logic",
  数学: "Mathematics",
  题解: "Problem Solutions",
  随笔: "Essays",
};

/** Make Chinese articles available in the English UI without duplicating source files. */
export function includeEnglishArticles(
  articles: readonly Article[],
): Article[] {
  const english = articles.filter((article) => article.locale === "en");
  const fallbacks = articles
    .filter((article) => article.locale === "zh-CN" && !article.draft)
    .filter(
      (article) =>
        !english.some(
          (candidate) =>
            !candidate.draft &&
            (candidate.slug === article.slug ||
              (article.translationKey &&
                candidate.translationKey === article.translationKey)),
        ),
    )
    .map((article): Article => ({
      ...article,
      locale: "en",
      contentLocale: "zh-CN",
      tags: article.tags.map((tag) => englishArticleTags[tag] ?? tag),
    }));

  // A draft translation must not hide the published Chinese article.
  return [
    ...articles.filter(
      (article) =>
        !(
          article.locale === "en" &&
          article.draft &&
          fallbacks.some((fallback) => fallback.slug === article.slug)
        ),
    ),
    ...fallbacks,
  ];
}
