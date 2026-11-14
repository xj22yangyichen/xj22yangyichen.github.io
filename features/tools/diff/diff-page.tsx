import { ArrowLeft } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { diffTool } from "../registry";
import { DiffWorkbench } from "./diff-workbench";
import "../tools.css";
import "./diff.css";

export function DiffPage({ locale }: { readonly locale: SiteLocale }) {
  return (
    <main className="shell tools-page">
      <SiteLink
        className="tools-back"
        href={getLocalizedPath("/tools/", locale)}
      >
        <ArrowLeft aria-hidden="true" />
        {locale === "en" ? "All tools" : "全部工具"}
      </SiteLink>
      <PageIntro
        title={diffTool.title[locale]}
        description={diffTool.description[locale]}
      />
      <DiffWorkbench locale={locale} />
    </main>
  );
}
