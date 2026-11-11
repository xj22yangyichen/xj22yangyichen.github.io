import { Chip } from "@heroui/react/chip";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import { SiteLink } from "@/components/ui/site-link";
import { ArticleViewStats } from "@/features/analytics/article-view-stats";
import { GiscusComments } from "@/features/comments/giscus-comments";
import { AdPlacement } from "@/features/monetization/ad-placement";
import { SponsorshipSection } from "@/features/monetization/sponsorship-section";
import { ArticleLayout } from "@/features/posts/article-layout";
import { ArticleNavigation } from "@/features/posts/article-navigation";
import { ArticleToc } from "@/features/posts/article-toc";
import { MarkdownContent } from "@/features/posts/markdown-content";
import { formatPostDateTime } from "@/features/posts/post-links";
import { articleContent } from "@/features/posts/posts-content";
import { getTagHref } from "@/features/tags/tag-links";
import { getArticleTocHeadings } from "@/lib/content/toc";
import type {
  Article,
  ArticleNavigation as ArticleNavigationData,
} from "@/lib/content/types";
import { readGiscusConfig } from "@/lib/giscus/config";
import { getLocalizedPath } from "@/lib/i18n";
import {
  resolveAdPlacement,
  resolveSponsorship,
} from "@/lib/monetization/config";

interface ArticlePageProps {
  readonly article: Article;
  readonly navigation: ArticleNavigationData;
}

export function ArticlePage({ article, navigation }: ArticlePageProps) {
  const content = articleContent[article.locale];
  const postsHref = getLocalizedPath("/posts/", article.locale);
  const giscusConfig = readGiscusConfig();
  if (giscusConfig && !article.commentId) {
    throw new Error(
      `${article.sourcePath}: add a permanent commentId before enabling comments.`,
    );
  }
  const advertisement = resolveAdPlacement("article", article.locale);
  const sponsorship = resolveSponsorship(article.locale);

  return (
    <main className="article-page">
      <header className="shell article-header">
        <SiteLink className="article-back-link" href={postsHref}>
          <ArrowLeft aria-hidden="true" />
          {content.back}
        </SiteLink>
        {article.locale === "en" && article.contentLocale === "zh-CN" ? (
          <p className="article-language-notice" role="note">
            This article is not available in English. The original Chinese text
            is shown below.
          </p>
        ) : null}
        <div className="article-header-meta">
          <time dateTime={article.published}>
            {formatPostDateTime(article.published, article.locale)}
          </time>
          <span>
            {article.wordCount} {content.words}
          </span>
          <span>
            {article.readTime} {content.minutes}
          </span>
          <ArticleViewStats locale={article.locale} slug={article.slug} />
        </div>
        <h1>{article.title}</h1>
        <div className="article-header-tags">
          {article.tags.map((tag) => (
            <Chip key={tag} size="sm" variant="soft">
              <SiteLink href={getTagHref(article.locale, tag)}>{tag}</SiteLink>
            </Chip>
          ))}
        </div>
      </header>

      {article.image ? (
        <div className="shell article-cover">
          <Image
            alt=""
            fill
            priority
            sizes="(max-width: 1228px) calc(100vw - 48px), 1180px"
            src={article.image}
          />
        </div>
      ) : null}

      <ArticleLayout
        hasToc={getArticleTocHeadings(article.headings).length > 0}
        key={`${article.locale}:${article.slug}`}
        labels={{
          collapse: content.collapseContents,
          expand: content.expandContents,
        }}
        toc={
          <ArticleToc headings={article.headings} title={content.contents} />
        }
      >
        <div lang={article.contentLocale ?? article.locale}>
          <MarkdownContent markdown={article.body} />
        </div>
        <AdPlacement advertisement={advertisement} locale={article.locale} />
        <ArticleNavigation
          ariaLabel={content.navigation}
          labels={{ next: content.next, previous: content.previous }}
          navigation={navigation}
        />
        <SponsorshipSection sponsorship={sponsorship} />
        <GiscusComments
          config={giscusConfig}
          locale={article.locale}
          commentId={article.commentId}
        />
      </ArticleLayout>
    </main>
  );
}
