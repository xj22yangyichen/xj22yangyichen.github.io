import type { Metadata } from "next";

import { ToolsPage } from "@/features/tools/tools-page";
import { toolboxCopy } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: toolboxCopy["zh-CN"].title,
  description: toolboxCopy["zh-CN"].description,
  locale: "zh-CN",
  pathname: "/tools/",
});

export default function Page() {
  return <ToolsPage locale="zh-CN" />;
}
