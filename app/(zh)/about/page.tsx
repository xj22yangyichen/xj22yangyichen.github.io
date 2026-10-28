import type { Metadata } from "next";

import { RedirectPage } from "@/features/static-page/redirect-page";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getLocalizedSiteConfig } from "@/lib/site-config";

const identity = getLocalizedSiteConfig("zh-CN");

export const metadata: Metadata = buildPageMetadata({
  description: identity.about,
  locale: "zh-CN",
  noIndex: true,
  pathname: "/",
});

export default function AboutPage() {
  return <RedirectPage href="/" label="前往首页" locale="zh-CN" />;
}
