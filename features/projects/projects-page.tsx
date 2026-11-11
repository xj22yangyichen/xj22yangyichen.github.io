import { ArrowUpRight } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { projects } from "./project-data";

export function ProjectsPage({ locale }: { readonly locale: SiteLocale }) {
  const english = locale === "en";
  return (
    <main className="shell projects-page">
      <PageIntro
        title={english ? "Projects" : "项目"}
        description={
          english
            ? "A collection of my projects, with notes on their design and implementation."
            : "记录我做过的项目，分享设计思路与实现过程。"
        }
      />
      <div className="project-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.slug}>
            <div className="project-card-meta">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{project.course}</span>
            </div>
            <h2>
              <SiteLink
                href={getLocalizedPath(
                  "/projects/" + project.slug + "/",
                  locale,
                )}
              >
                {english ? project.name : project.nameZh}
              </SiteLink>
            </h2>
            <h3 lang="zh-CN">{project.subtitle}</h3>
            <p lang="zh-CN">{project.summary}</p>
            <ul
              className="project-tags"
              aria-label={english ? "Technologies" : "技术主题"}
            >
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className="project-card-actions">
              <SiteLink
                className="text-link"
                href={getLocalizedPath(
                  "/projects/" + project.slug + "/",
                  locale,
                )}
              >
                {english ? "Read report" : "阅读报告"}
                <ArrowUpRight aria-hidden="true" />
              </SiteLink>
              <a
                className="project-source-link"
                href={project.repository}
                target="_blank"
                rel="noreferrer"
              >
                {english ? "GitHub" : "项目源码"}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
