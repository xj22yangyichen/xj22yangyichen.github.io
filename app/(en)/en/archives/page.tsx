import type { Metadata } from "next";

import { postsContent } from "@/features/posts/posts-content";
import { RedirectPage } from "@/features/static-page/redirect-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: postsContent["en"].description,
  locale: "en",
  noIndex: true,
  pathname: "/en/posts/",
  title: postsContent["en"].title,
});

export default function EnglishArchivesPage() {
  return <RedirectPage href="/en/posts/" locale="en" />;
}
