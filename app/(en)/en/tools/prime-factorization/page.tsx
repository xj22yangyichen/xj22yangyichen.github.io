import type { Metadata } from "next";
import { IntegerPage } from "@/features/tools/integer/integer-page";
import { integerTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: integerTools.factor.title["en"],
  description: integerTools.factor.description["en"],
  locale: "en",
  pathname: "/en/tools/prime-factorization/",
});

export default function Page() {
  return <IntegerPage locale="en" operation="factor" />;
}
