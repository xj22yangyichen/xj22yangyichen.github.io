import { readFile } from "node:fs/promises";
import path from "node:path";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { SiteLink } from "@/components/ui/site-link";
import { ArticleLayout } from "@/features/posts/article-layout";
import { ArticleToc } from "@/features/posts/article-toc";
import { MarkdownContent } from "@/features/posts/markdown-content";
import { analyzeMarkdown } from "@/lib/content/markdown";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import type { Project } from "./project-data";

export async function ProjectReport({
  project,
  locale,
}: {
  readonly project: Project;
  readonly locale: SiteLocale;
}) {
  const body = await readFile(
    path.join(process.cwd(), "content/projects", project.slug + ".md"),
    "utf8",
  );
  const { headings } = analyzeMarkdown(body);
  const english = locale === "en";

  return (
    <main className="article-page project-report">
      <header className="shell article-header">
        <SiteLink
          className="article-back-link"
          href={getLocalizedPath("/projects/", locale)}
        >
          <ArrowLeft aria-hidden="true" />
          {english ? "All projects" : "全部项目"}
        </SiteLink>
        <div className="article-header-meta">
          <span>{project.course}</span>
          <span>{project.tags.join(" / ")}</span>
        </div>
        <h1>{english ? project.name : project.nameZh}</h1>
        <p className="project-subtitle" lang="zh-CN">
          {project.subtitle}
        </p>
        <a
          className="text-link"
          href={project.repository}
          target="_blank"
          rel="noreferrer"
        >
          {english ? "View source" : "查看源码"}
          <ArrowUpRight aria-hidden="true" />
        </a>
        {english ? (
          <p className="article-language-notice">
            This report is currently available in Chinese.
          </p>
        ) : null}
      </header>
      <ArticleLayout
        hasToc={headings.length > 0}
        labels={{
          collapse: english ? "Collapse contents" : "收起目录",
          expand: english ? "Expand contents" : "展开目录",
        }}
        toc={
          <ArticleToc
            headings={headings}
            title={english ? "Contents" : "目录"}
          />
        }
      >
        <div lang="zh-CN">
          <MarkdownContent markdown={body} />
        </div>
      </ArticleLayout>
    </main>
  );
}
