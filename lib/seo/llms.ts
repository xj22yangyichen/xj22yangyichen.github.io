import { getPostHref } from "@/features/posts/post-links";
import { getPublishedArticles } from "@/lib/content/queries";
import type { Article, Book } from "@/lib/content/types";
import { getAbsoluteUrl, getLocaleDescription } from "@/lib/seo/metadata";
import { siteConfig, type SiteLocale } from "@/lib/site-config";

interface LlmsTextInput {
  readonly articles: readonly Article[];
  readonly books: readonly Book[];
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function escapeMarkdownInline(value: string): string {
  return normalizeInlineText(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replaceAll("<", "\\<")
    .replaceAll(">", "\\>");
}

function formatResource(
  title: string,
  pathname: string,
  description: string,
): string {
  return `- [${escapeMarkdownInline(title)}](${getAbsoluteUrl(pathname).toString()}): ${escapeMarkdownInline(description)}`;
}

function appendSection(
  lines: string[],
  title: string,
  resources: readonly string[],
): void {
  if (resources.length === 0) return;

  lines.push(`## ${title}`, "", ...resources, "");
}

function buildArticleResources(
  articles: readonly Article[],
  locale: SiteLocale,
): string[] {
  return getPublishedArticles(articles, locale).map((article) =>
    formatResource(
      article.title,
      getPostHref(locale, article.slug),
      article.description,
    ),
  );
}

export function buildLlmsText({ articles }: LlmsTextInput): string {
  const lines = [
    `# ${escapeMarkdownInline(siteConfig.brand.name["zh-CN"])}`,
    "",
    `> ${escapeMarkdownInline(getLocaleDescription("zh-CN"))} ${escapeMarkdownInline(getLocaleDescription("en"))}`,
    "",
    "Published Chinese and English writing is listed separately. Drafts are excluded. 中文与英文内容分别列出，草稿不包含在内。",
    "",
  ];

  appendSection(
    lines,
    "Chinese articles",
    buildArticleResources(articles, "zh-CN"),
  );
  appendSection(
    lines,
    "English articles",
    buildArticleResources(articles, "en"),
  );
  appendSection(lines, "Site indexes", [
    formatResource(
      siteConfig.brand.name["zh-CN"],
      "/",
      "Chinese homepage and author introduction.",
    ),
    formatResource(
      siteConfig.brand.name.en,
      "/en/",
      "English homepage and author introduction.",
    ),
    formatResource("Chinese articles", "/posts/", "All Chinese articles."),
    formatResource("English articles", "/en/posts/", "All English articles."),
    formatResource("Chinese RSS", "/rss.xml", "Chinese article feed."),
    formatResource("English RSS", "/en/rss.xml", "English article feed."),
    formatResource("Sitemap", "/sitemap.xml", "Complete public URL index."),
  ]);

  return `${lines.join("\n").trimEnd()}\n`;
}
