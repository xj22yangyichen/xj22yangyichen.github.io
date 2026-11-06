"use client";

import { ChevronRight } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

interface ArticleLayoutProps {
  readonly children: ReactNode;
  readonly hasToc: boolean;
  readonly labels: { readonly collapse: string; readonly expand: string };
  readonly toc: ReactNode;
}

export function ArticleLayout({
  children,
  hasToc,
  labels,
  toc,
}: ArticleLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const tocId = useId();
  const toggleLabel = isCollapsed ? labels.expand : labels.collapse;

  return (
    <div
      className="shell article-layout"
      data-toc={hasToc ? (isCollapsed ? "collapsed" : "expanded") : "none"}
    >
      <article>{children}</article>
      {hasToc ? (
        <div className="article-toc-region">
          <button
            aria-controls={tocId}
            aria-expanded={!isCollapsed}
            aria-label={toggleLabel}
            className="article-toc-toggle"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            title={toggleLabel}
            type="button"
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <div
            aria-hidden={isCollapsed}
            className="article-toc-panel"
            id={tocId}
            inert={isCollapsed}
          >
            {toc}
          </div>
        </div>
      ) : null}
    </div>
  );
}
