import type { Metadata } from "next";

import { RadixPage } from "@/features/tools/radix/radix-page";
import { radixTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: radixTool.title["en"],
  description: radixTool.description["en"],
  locale: "en",
  pathname: "/en/tools/radix/",
});

export default function Page() {
  return <RadixPage locale="en" />;
}
