import type { Metadata } from "next";

import { RegexPage } from "@/features/tools/regex/regex-page";
import { regexTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: regexTool.title.en,
  description: regexTool.description.en,
  locale: "en",
  pathname: "/en/tools/regex/",
});

export default function Page() {
  return <RegexPage locale="en" />;
}
