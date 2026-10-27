import { describe, expect, it } from "vitest";

import {
  extractAutoRagSources,
  mapAutoRagCitations,
  resolveCitationHref,
} from "@/lib/ai-search/citations";

describe("AI search citation mapping", () => {
  it("maps legacy Chinese filenames to canonical article URLs", () => {
    expect(resolveCitationHref("src/content/posts/sample-post.md")).toBe(
      "/posts/sample-post/",
    );
  });

  it("keeps English citations in the English route tree", () => {
    expect(
      resolveCitationHref(
        "content/posts/en/cloudflare-ai-search-autorag-integration-for-blog-knowledge-assistant.md",
      ),
    ).toBe(
      "/en/posts/cloudflare-ai-search-autorag-integration-for-blog-knowledge-assistant/",
    );
    expect(resolveCitationHref("content/posts/bad slug.md")).toBeNull();
  });

  it("maps indexed article URLs and legacy English routes", () => {
    expect(
      resolveCitationHref(
        "https://xj22yangyichen.github.io/posts/sample-post/?source=autorag",
      ),
    ).toBe("/posts/sample-post/");
    expect(resolveCitationHref("/posts/en/english-article/")).toBe(
      "/en/posts/english-article/",
    );
    expect(resolveCitationHref("/en/posts/english-article/index.html")).toBe(
      "/en/posts/english-article/",
    );
  });

  it("maps overview, book and tag pages without treating them as articles", () => {
    expect(resolveCitationHref("https://xj22yangyichen.github.io/")).toBe("/");
    expect(
      resolveCitationHref("https://xj22yangyichen.github.io/en/about/"),
    ).toBe("/en/about/");
    expect(resolveCitationHref("/books/cloudflare-guide/index.html")).toBe(
      "/books/cloudflare-guide/",
    );
    expect(resolveCitationHref("/tags/Cloudflare/")).toBe("/tags/Cloudflare/");
    expect(
      resolveCitationHref(
        "content/books/zh/cloudflare-guide/getting-started.md",
      ),
    ).toBe("/books/cloudflare-guide/getting-started/");
  });

  it("uses source URLs when filenames cannot identify a blog article", () => {
    expect(
      mapAutoRagCitations(
        [
          {
            attributes: {
              title: "AI Agent 深度学习指南",
              url: "https://xj22yangyichen.github.io/posts/sample-guide/",
            },
            filename: "indexed-web-page",
            score: 0.88,
          },
          {
            title: "English article",
            url: "https://xj22yangyichen.github.io/en/posts/english-article/",
          },
        ],
        5,
      ),
    ).toEqual([
      {
        filename: "https://xj22yangyichen.github.io/posts/sample-guide/",
        href: "/posts/sample-guide/",
        score: 0.88,
        title: "AI Agent 深度学习指南",
      },
      {
        filename: "https://xj22yangyichen.github.io/en/posts/english-article/",
        href: "/en/posts/english-article/",
        score: null,
        title: "English article",
      },
    ]);
  });

  it("keeps the readable legacy slug as the fallback title", () => {
    expect(
      mapAutoRagCitations(
        [
          {
            filename:
              "https://xj22yangyichen.github.io/posts/cloudflare-ai-search-autorag-%E6%8E%A5%E5%85%A5%E5%AE%9E%E6%88%98-%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E7%9A%84%E7%9F%A5%E8%AF%86%E5%BA%93ai%E5%8A%A9%E6%89%8B/",
          },
        ],
        1,
      )[0]?.title,
    ).toBe("cloudflare ai search autorag 接入实战 个人博客的知识库ai助手");
  });

  it("deduplicates, caps and validates AutoRAG sources", () => {
    expect(
      mapAutoRagCitations(
        [
          {
            attributes: { title: "Claude Code 使用 ChatGPT" },
            filename: "sample-post.md",
            score: 0.92,
          },
          {
            filename: "sample-post.md",
            score: 0.8,
          },
          { filename: "not-markdown.txt" },
          {
            filename: "cloudflare-workers-ai-3594342e.mdx",
            score: 1.7,
          },
        ],
        2,
      ),
    ).toEqual([
      {
        filename: "sample-post.md",
        href: "/posts/sample-post/",
        score: 0.92,
        title: "Claude Code 使用 ChatGPT",
      },
      {
        filename: "cloudflare-workers-ai-3594342e.mdx",
        href: "/posts/cloudflare-workers-ai-3594342e/",
        score: 1,
        title: "cloudflare workers ai",
      },
    ]);
  });

  it("filters numeric reranker scores below the local trust threshold", () => {
    expect(
      mapAutoRagCitations(
        [
          { filename: "low-score.md", score: 0.14 },
          { filename: "accepted.md", score: 0.18 },
          { filename: "score-unavailable.md" },
        ],
        5,
        0.15,
      ).map(({ href }) => href),
    ).toEqual(["/posts/accepted/", "/posts/score-unavailable/"]);
  });

  it("extracts sources from direct and wrapped AutoRAG search results", () => {
    const sources = [{ filename: "article.md" }];
    expect(extractAutoRagSources({ data: sources })).toBe(sources);
    expect(extractAutoRagSources({ result: { data: sources } })).toBe(sources);
    expect(extractAutoRagSources({ result: {} })).toEqual([]);
  });
});
