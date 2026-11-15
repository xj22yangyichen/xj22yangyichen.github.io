import type { Metadata } from "next";
import { MatrixPage } from "@/features/tools/matrix/matrix-page";
import { matrixTools } from "@/features/tools/registry";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: matrixTools.inverse.title["en"],
  description: matrixTools.inverse.description["en"],
  locale: "en",
  pathname: "/en/tools/matrix-inverse/",
});

export default function Page() {
  return <MatrixPage locale="en" operation="inverse" />;
}
