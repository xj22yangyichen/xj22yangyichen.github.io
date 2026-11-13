import { ArrowLeft } from "lucide-react";

import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";

import { base64Tool } from "../registry";
import { Base64Workbench } from "./base64-workbench";
import "../tools.css";

export function Base64Page({ locale }: { readonly locale: SiteLocale }) {
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
        title={base64Tool.title[locale]}
        description={base64Tool.description[locale]}
      />
      <Base64Workbench locale={locale} />
    </main>
  );
}
