import type { Article, Book } from "@/lib/content/types";
export function article(overrides: Partial<Article> = {}): Article {
  return {
    body: "Testing bilingual search and content.",
    plainText: "Testing bilingual search and content.",
    description: "An example description.",
    draft: false,
    headings: [],
    locale: "zh-CN",
    pinned: false,
    published: "2026-10-27",
    readTime: 1,
    slug: "sample-post",
    sourcePath: "content/posts/zh/sample-post.md",
    tags: ["学习"],
    title: "学习记录",
    wordCount: 10,
    ...overrides,
  };
}
export const articles = [
  article({ translationKey: "sample" }),
  article({
    locale: "en",
    slug: "sample-english",
    title: "Learning notes",
    translationKey: "sample",
  }),
  article({ slug: "older-post", published: "2025-01-01" }),
  article({ slug: "draft-post", draft: true }),
];
export const books: Book[] = [
  {
    body: "Introduction.",
    plainText: "Introduction.",
    chapters: [],
    description: "Sample book.",
    draft: false,
    headings: [],
    locale: "zh-CN",
    order: 1,
    slug: "sample-book",
    sourcePath: "content/books/zh/sample-book/index.md",
    status: "complete",
    tags: ["学习"],
    title: "Sample book",
  },
];
