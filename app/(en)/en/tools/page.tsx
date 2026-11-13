import type { Metadata } from "next";

import { ToolsPage } from "@/features/tools/tools-page";
import { toolboxCopy } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: toolboxCopy["en"].title,
  description: toolboxCopy["en"].description,
  locale: "en",
  pathname: "/en/tools/",
});

export default function Page() {
  return <ToolsPage locale="en" />;
}
