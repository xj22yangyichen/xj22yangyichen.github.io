import { ArrowLeft } from "lucide-react";
import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";
import { integerTools, type IntegerOperation } from "../registry";
import { IntegerWorkbench } from "./integer-workbench";
import "../tools.css";

export function IntegerPage({
  locale,
  operation,
}: {
  readonly locale: SiteLocale;
  readonly operation: IntegerOperation;
}) {
  const tool = integerTools[operation];
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
        title={tool.title[locale]}
        description={tool.description[locale]}
      />
      <IntegerWorkbench locale={locale} operation={operation} />
    </main>
  );
}
