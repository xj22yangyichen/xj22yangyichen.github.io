import type { Metadata } from "next";

import { RadixPage } from "@/features/tools/radix/radix-page";
import { radixTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: radixTool.title["zh-CN"],
  description: radixTool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/radix/",
});

export default function Page() {
  return <RadixPage locale="zh-CN" />;
}
