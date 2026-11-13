import type { Metadata } from "next";

import { Base64Page } from "@/features/tools/base64/base64-page";
import { base64Tool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: base64Tool.title["en"],
  description: base64Tool.description["en"],
  locale: "en",
  pathname: "/en/tools/base64/",
});

export default function Page() {
  return <Base64Page locale="en" />;
}
