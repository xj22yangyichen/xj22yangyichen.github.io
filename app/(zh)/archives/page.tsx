import type { Metadata } from "next";

import { postsContent } from "@/features/posts/posts-content";
import { RedirectPage } from "@/features/static-page/redirect-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: postsContent["zh-CN"].description,
  locale: "zh-CN",
  noIndex: true,
  pathname: "/posts/",
  title: postsContent["zh-CN"].title,
});

export default function ArchivesPage() {
  return <RedirectPage href="/posts/" locale="zh-CN" />;
}
