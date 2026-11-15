import type { Metadata } from "next";
import { MatrixPage } from "@/features/tools/matrix/matrix-page";
import { matrixTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: matrixTools.eigenvalues.title["zh-CN"],
  description: matrixTools.eigenvalues.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/matrix-eigenvalues/",
});

export default function Page() {
  return <MatrixPage locale="zh-CN" operation="eigenvalues" />;
}
