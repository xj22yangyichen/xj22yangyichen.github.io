import type { Metadata } from "next";

import { StaticPage } from "@/features/static-page/static-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: "学术发表",
  locale: "zh-CN",
  pathname: "/publications/",
  title: "学术发表",
});

export default function PublicationsPage() {
  return <StaticPage title="学术发表" />;
}
