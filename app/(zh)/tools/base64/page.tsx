import type { Metadata } from "next";

import { Base64Page } from "@/features/tools/base64/base64-page";
import { base64Tool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: base64Tool.title["zh-CN"],
  description: base64Tool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/base64/",
});

export default function Page() {
  return <Base64Page locale="zh-CN" />;
}
