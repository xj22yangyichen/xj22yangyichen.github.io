import { ArrowLeft } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { regexTool } from "../registry";
import { RegexWorkbench } from "./regex-workbench";
import "../tools.css";
import "./regex.css";

export function RegexPage({ locale }: { readonly locale: SiteLocale }) {
  return (
    <main className="shell tools-page">
      <PageIntro
        title={regexTool.title[locale]}
        description={regexTool.description[locale]}
      />
      <SiteLink
        className="tools-back"
        href={getLocalizedPath("/tools/", locale)}
      >
        <ArrowLeft aria-hidden="true" />
        {locale === "en" ? "All tools" : "全部工具"}
      </SiteLink>
      <RegexWorkbench locale={locale} />
    </main>
  );
}
