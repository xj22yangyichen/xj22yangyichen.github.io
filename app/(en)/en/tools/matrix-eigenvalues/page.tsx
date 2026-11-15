import type { Metadata } from "next";
import { MatrixPage } from "@/features/tools/matrix/matrix-page";
import { matrixTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: matrixTools.eigenvalues.title["en"],
  description: matrixTools.eigenvalues.description["en"],
  locale: "en",
  pathname: "/en/tools/matrix-eigenvalues/",
});

export default function Page() {
  return <MatrixPage locale="en" operation="eigenvalues" />;
}
