import type { Metadata } from "next";

import { ProjectsPage as ProjectsPageView } from "@/features/projects/projects-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "A collection of my projects, with notes on their design and implementation.",
  locale: "en",
  pathname: "/en/projects/",
  title: "Projects",
});

export default function ProjectsPage() {
  return <ProjectsPageView locale="en" />;
}
