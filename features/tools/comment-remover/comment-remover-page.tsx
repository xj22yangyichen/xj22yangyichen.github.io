import { ArrowLeft } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { commentRemoverTool } from "../registry";
import { CommentRemoverWorkbench } from "./comment-remover-workbench";
import "../tools.css";

export function CommentRemoverPage({
  locale,
}: {
  readonly locale: SiteLocale;
}) {
  return (
    <main className="shell tools-page comment-remover-page">
      <PageIntro
        title={commentRemoverTool.title[locale]}
        description={commentRemoverTool.description[locale]}
      />
      <SiteLink
        className="tools-back"
        href={getLocalizedPath("/tools/", locale)}
      >
        <ArrowLeft aria-hidden="true" />
        {locale === "en" ? "All tools" : "全部工具"}
      </SiteLink>
      <CommentRemoverWorkbench locale={locale} />
    </main>
  );
}
