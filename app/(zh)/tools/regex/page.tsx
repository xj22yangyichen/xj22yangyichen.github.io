import type { Metadata } from "next";

import { RegexPage } from "@/features/tools/regex/regex-page";
import { regexTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: regexTool.title["zh-CN"],
  description: regexTool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/regex/",
});

export default function Page() {
  return <RegexPage locale="zh-CN" />;
}
