import type { Metadata } from "next";

import { TimestampPage } from "@/features/tools/timestamp/timestamp-page";
import { timestampTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: timestampTool.title["en"],
  description: timestampTool.description["en"],
  locale: "en",
  pathname: "/en/tools/timestamp/",
});

export default function Page() {
  return <TimestampPage locale="en" />;
}
