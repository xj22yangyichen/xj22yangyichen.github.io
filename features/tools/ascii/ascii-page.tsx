import { ArrowLeft } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { asciiTool } from "../registry";
import { AsciiWorkbench } from "./ascii-workbench";
import "../tools.css";

export function AsciiPage({ locale }: { readonly locale: SiteLocale }) {
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
        title={asciiTool.title[locale]}
        description={asciiTool.description[locale]}
      />
      <AsciiWorkbench locale={locale} />
    </main>
  );
}
