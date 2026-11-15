import type { Metadata } from "next";
import { MatrixPage } from "@/features/tools/matrix/matrix-page";
import { matrixTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: matrixTools.inverse.title["zh-CN"],
  description: matrixTools.inverse.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/matrix-inverse/",
});

export default function Page() {
  return <MatrixPage locale="zh-CN" operation="inverse" />;
}
