import type { Metadata } from "next";

import { CommentRemoverPage } from "@/features/tools/comment-remover/comment-remover-page";
import { commentRemoverTool } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: commentRemoverTool.title["zh-CN"],
  description: commentRemoverTool.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/comment-remover/",
});

export default function Page() {
  return <CommentRemoverPage locale="zh-CN" />;
}
