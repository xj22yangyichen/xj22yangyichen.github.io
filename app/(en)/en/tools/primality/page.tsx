import type { Metadata } from "next";
import { IntegerPage } from "@/features/tools/integer/integer-page";
import { integerTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: integerTools.prime.title["en"],
  description: integerTools.prime.description["en"],
  locale: "en",
  pathname: "/en/tools/primality/",
});

export default function Page() {
  return <IntegerPage locale="en" operation="prime" />;
}
