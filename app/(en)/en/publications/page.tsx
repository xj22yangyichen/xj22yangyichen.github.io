import type { Metadata } from "next";

import { StaticPage } from "@/features/static-page/static-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: "Publications",
  locale: "en",
  pathname: "/en/publications/",
  title: "Publications",
});

export default function PublicationsPage() {
  return <StaticPage title="Publications" />;
}
