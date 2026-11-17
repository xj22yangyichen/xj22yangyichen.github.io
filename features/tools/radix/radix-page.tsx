import { ArrowLeft } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { radixTool } from "../registry";
import { RadixWorkbench } from "./radix-workbench";
import "../tools.css";

export function RadixPage({ locale }: { readonly locale: SiteLocale }) {
  return (
    <main className="shell tools-page">
      <PageIntro
        title={radixTool.title[locale]}
        description={radixTool.description[locale]}
      />
      <SiteLink
        className="tools-back"
        href={getLocalizedPath("/tools/", locale)}
      >
        <ArrowLeft aria-hidden="true" />
        {locale === "en" ? "All tools" : "全部工具"}
      </SiteLink>
      <RadixWorkbench locale={locale} />
    </main>
  );
}
