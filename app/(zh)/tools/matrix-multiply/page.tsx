import type { Metadata } from "next";
import { MatrixPage } from "@/features/tools/matrix/matrix-page";
import { matrixTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: matrixTools.multiply.title["zh-CN"],
  description: matrixTools.multiply.description["zh-CN"],
  locale: "zh-CN",
  pathname: "/tools/matrix-multiply/",
});

export default function Page() {
  return <MatrixPage locale="zh-CN" operation="multiply" />;
}
