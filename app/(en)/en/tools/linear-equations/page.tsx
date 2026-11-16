import type { Metadata } from "next";
import { MatrixPage } from "@/features/tools/matrix/matrix-page";
import { matrixTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: matrixTools.solve.title["en"],
  description: matrixTools.solve.description["en"],
  locale: "en",
  pathname: "/en/tools/linear-equations/",
});

export default function Page() {
  return <MatrixPage locale="en" operation="solve" />;
}
