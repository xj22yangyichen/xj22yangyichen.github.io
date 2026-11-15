import {
  ArrowUpRight,
  Calculator,
  Clock,
  Type,
  type LucideIcon,
} from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { toolboxCopy, tools, type ToolCategory } from "./registry";
import "./tools.css";

const categoryIcons = {
  text: Type,
  math: Calculator,
  time: Clock,
} satisfies Record<ToolCategory, LucideIcon>;

export function ToolsPage({ locale }: { readonly locale: SiteLocale }) {
  const english = locale === "en";
  return (
    <main className="shell tools-page">
      <PageIntro {...toolboxCopy[locale]} />
      <div className="tools-grid">
        {tools.map((tool) => {
          const Icon = categoryIcons[tool.categoryId];
          return (
            <SiteLink
              className="tool-card"
              href={getLocalizedPath(`/tools/${tool.slug}/`, locale)}
              key={tool.slug}
            >
              <div className="tool-card-top">
                <span className="tool-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="tool-category">{tool.category[locale]}</span>
              </div>
              <h2>{tool.title[locale]}</h2>
              <p>{tool.description[locale]}</p>
              <span className="tool-card-link">
                {english ? "Open tool" : "打开工具"}
                <ArrowUpRight aria-hidden="true" />
              </span>
            </SiteLink>
          );
        })}
      </div>
    </main>
  );
}
