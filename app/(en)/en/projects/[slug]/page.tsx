import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findProject, projects } from "@/features/projects/project-data";
import { ProjectReport } from "@/features/projects/project-report";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

interface ProjectRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectRouteProps): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) notFound();
  return buildPageMetadata({
    description: project.summary,
    locale: "en",
    pathname: "/en/projects/" + project.slug + "/",
    title: project.name + " · " + project.subtitle,
  });
}

export default async function ProjectPage({ params }: ProjectRouteProps) {
  const project = findProject((await params).slug);
  if (!project) notFound();
  return <ProjectReport project={project} locale="en" />;
}
