import { Calculator, Clock, Type, type LucideIcon } from "lucide-react";

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
              <span className="tool-icon">
                {tool.slug === "comment-remover" ? (
                  <span className="tool-icon-code" aria-hidden="true">
                    {"/**/"}
                  </span>
                ) : (
                  <Icon aria-hidden="true" />
                )}
              </span>
              <h2>{tool.title[locale]}</h2>
            </SiteLink>
          );
        })}
      </div>
    </main>
  );
}
