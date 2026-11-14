import type { Metadata } from "next";

import { DiffPage } from "@/features/tools/diff/diff-page";
import { diffTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: diffTool.title["en"],
  description: diffTool.description["en"],
  locale: "en",
  pathname: "/en/tools/diff/",
});

export default function Page() {
  return <DiffPage locale="en" />;
}
