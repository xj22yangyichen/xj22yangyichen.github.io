import type { Metadata } from "next";

import { FileTypePage } from "@/features/tools/file-type/file-type-page";
import { fileTypeTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: fileTypeTool.title["en"],
  description: fileTypeTool.description["en"],
  locale: "en",
  pathname: "/en/tools/file-type/",
});

export default function Page() {
  return <FileTypePage locale="en" />;
}
