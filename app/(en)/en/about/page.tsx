import type { Metadata } from "next";

import { RedirectPage } from "@/features/static-page/redirect-page";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getLocalizedSiteConfig } from "@/lib/site-config";

const identity = getLocalizedSiteConfig("en");

export const metadata: Metadata = buildPageMetadata({
  description: identity.about,
  locale: "en",
  noIndex: true,
  pathname: "/en/",
});

export default function EnglishAboutPage() {
  return <RedirectPage href="/en/" label="Go to home" locale="en" />;
}
