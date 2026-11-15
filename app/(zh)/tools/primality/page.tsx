import type { Metadata } from "next";
import { IntegerPage } from "@/features/tools/integer/integer-page";
import { integerTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: integerTools.prime.title["zh-CN"],
  description: integerTools.prime.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/primality/",
});

export default function Page() {
  return <IntegerPage locale="zh-CN" operation="prime" />;
}
