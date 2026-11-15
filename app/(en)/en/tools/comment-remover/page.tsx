import type { Metadata } from "next";

import { CommentRemoverPage } from "@/features/tools/comment-remover/comment-remover-page";
import { commentRemoverTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: commentRemoverTool.title["en"],
  description: commentRemoverTool.description["en"],
  locale: "en",
  pathname: "/en/tools/comment-remover/",
});

export default function Page() {
  return <CommentRemoverPage locale="en" />;
}
