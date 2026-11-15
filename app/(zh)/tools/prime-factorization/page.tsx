import type { Metadata } from "next";
import { IntegerPage } from "@/features/tools/integer/integer-page";
import { integerTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: integerTools.factor.title["zh-CN"],
  description: integerTools.factor.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/prime-factorization/",
});

export default function Page() {
  return <IntegerPage locale="zh-CN" operation="factor" />;
}
