import type { Metadata } from "next";

import { DiffPage } from "@/features/tools/diff/diff-page";
import { diffTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: diffTool.title["zh-CN"],
  description: diffTool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/diff/",
});

export default function Page() {
  return <DiffPage locale="zh-CN" />;
}
