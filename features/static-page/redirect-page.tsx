import type { SiteLocale } from "@/lib/site-config";

interface RedirectPageProps {
  readonly href: string;
  readonly locale: SiteLocale;
}

export function RedirectPage({ href, locale }: RedirectPageProps) {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <main className="shell static-page">
        <p>
          <a href={href}>
            {locale === "en" ? "Continue to all writing" : "前往所有文章"}
          </a>
        </p>
      </main>
    </>
  );
}
