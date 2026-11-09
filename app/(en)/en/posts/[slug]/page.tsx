import {
  ensureStaticParams,
  emptyContentSegment,
} from "@/lib/deployment/static-params";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ArticlePage } from "@/features/posts/article-page";
import {
  decodePostSlug,
  getPostRedirectHref,
} from "@/features/posts/post-links";
import { RedirectPage } from "@/features/static-page/redirect-page";
import {
  findArticleTranslation,
  findPublishedArticle,
  getArticleNavigation,
  getPublishedArticles,
} from "@/lib/content/queries";
import { getAllArticles } from "@/lib/content/repository";
import {
  buildArticleMetadata,
  buildArticleStructuredData,
} from "@/lib/seo/content-metadata";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { redirectsConfig } from "@/redirects.config";

export const dynamicParams = false;

interface ArticleRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();

  return ensureStaticParams(
    [
      ...getPublishedArticles(articles, "en").map(({ slug }) => ({ slug })),
      ...redirectsConfig.postSlugs.map(({ from }) => ({ slug: from })),
    ],
    { slug: emptyContentSegment },
  );
}

export async function generateMetadata({
  params,
}: ArticleRouteProps): Promise<Metadata> {
  const [{ slug }, articles] = await Promise.all([params, getAllArticles()]);
  const decodedSlug = decodePostSlug(slug);
  const redirectHref = getPostRedirectHref("en", decodedSlug);
  if (redirectHref) {
    return buildPageMetadata({
      description: "This article has moved to a new address.",
      locale: "en",
      noIndex: true,
      pathname: redirectHref,
      title: "Article moved",
    });
  }
  const article = findPublishedArticle(articles, "en", decodedSlug);

  return article
    ? buildArticleMetadata(
        article,
        findArticleTranslation(articles, article, "zh-CN"),
      )
    : buildPageMetadata({
        alternatePaths: { en: `/en/posts/${decodedSlug}/` },
        description: "There is no post at this address.",
        locale: "en",
        noIndex: true,
        pathname: `/en/posts/${decodedSlug}/`,
        title: "Post not found",
      });
}

export default async function EnglishArticlePage({
  params,
}: ArticleRouteProps) {
  const [{ slug }, articles] = await Promise.all([params, getAllArticles()]);
  const decodedSlug = decodePostSlug(slug);
  const redirectHref = getPostRedirectHref("en", decodedSlug);
  if (redirectHref) {
    return (
      <RedirectPage
        href={redirectHref}
        label="Continue to article"
        locale="en"
      />
    );
  }
  const article = findPublishedArticle(articles, "en", decodedSlug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildArticleStructuredData(article)} />
      <ArticlePage
        article={article}
        navigation={getArticleNavigation(articles, article)}
      />
    </>
  );
}
