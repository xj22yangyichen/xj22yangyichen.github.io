import type { Metadata } from "next";

import { ProjectsPage as ProjectsPageView } from "@/features/projects/projects-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description: "记录我做过的项目，分享设计思路与实现过程。",
  locale: "zh-CN",
  pathname: "/projects/",
  title: "项目",
});

export default function ProjectsPage() {
  return <ProjectsPageView locale="zh-CN" />;
}
