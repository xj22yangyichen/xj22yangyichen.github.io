import path from "node:path";
import { rm } from "node:fs/promises";

import { emptyContentSegment } from "@/lib/deployment/static-params";

import {
  localizedNotFoundPages,
  prepareLocalizedNotFoundPages,
} from "@/lib/deployment/localized-not-found";

async function main(): Promise<void> {
  const outputDirectory = path.resolve("out");
  await prepareLocalizedNotFoundPages(outputDirectory);
  // Reserved empty routes are build plumbing and must never be published.
  for (const prefix of ["", "en"]) {
    for (const section of ["posts", "books", "tags"]) {
      const target = path.resolve(
        outputDirectory,
        prefix,
        section,
        emptyContentSegment,
      );
      if (!target.startsWith(`${outputDirectory}${path.sep}`)) {
        throw new Error("Invalid empty-route cleanup path.");
      }
      await rm(target, { recursive: true, force: true });
    }
  }
  console.log(
    `Prepared ${localizedNotFoundPages.length} localized Pages 404 file(s).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
