import type { Metadata } from "next";

import { TimestampPage } from "@/features/tools/timestamp/timestamp-page";
import { timestampTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: timestampTool.title["zh-CN"],
  description: timestampTool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/timestamp/",
});

export default function Page() {
  return <TimestampPage locale="zh-CN" />;
}
