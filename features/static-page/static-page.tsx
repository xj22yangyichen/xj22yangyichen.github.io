import { PageIntro } from "@/components/page/page-intro";

interface StaticPageProps {
  readonly description: string;
  readonly title: string;
}

export function StaticPage({ description, title }: StaticPageProps) {
  return (
    <main className="shell static-page">
      <PageIntro description={description} title={title} />
    </main>
  );
}
