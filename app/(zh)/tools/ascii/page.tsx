import type { Metadata } from "next";

import { AsciiPage } from "@/features/tools/ascii/ascii-page";
import { asciiTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: asciiTool.title["zh-CN"],
  description: asciiTool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/ascii/",
});

export default function Page() {
  return <AsciiPage locale="zh-CN" />;
}
