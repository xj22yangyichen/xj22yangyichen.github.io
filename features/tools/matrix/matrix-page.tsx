import { ArrowLeft } from "lucide-react";
import { PageIntro } from "@/components/page/page-intro";
import { SiteLink } from "@/components/ui/site-link";
import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";
import { matrixTools, type MatrixOperation } from "../registry";
import { MatrixWorkbench } from "./matrix-workbench";
import "../tools.css";

export function MatrixPage({
  locale,
  operation,
}: {
  readonly locale: SiteLocale;
  readonly operation: MatrixOperation;
}) {
  const tool = matrixTools[operation];
  return (
    <main className="shell tools-page">
      <PageIntro
        title={tool.title[locale]}
        description={tool.description[locale]}
      />
      <SiteLink
        className="tools-back"
        href={getLocalizedPath("/tools/", locale)}
      >
        <ArrowLeft aria-hidden="true" />
        {locale === "en" ? "All tools" : "全部工具"}
      </SiteLink>
      <MatrixWorkbench locale={locale} operation={operation} />
    </main>
  );
}
