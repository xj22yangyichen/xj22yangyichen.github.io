import type { Metadata } from "next";

import { StaticPage } from "@/features/static-page/static-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: "Projects",
  locale: "zh-CN",
  pathname: "/projects/",
  title: "Projects",
});

export default function ProjectsPage() {
  return <StaticPage title="Projects" />;
}
