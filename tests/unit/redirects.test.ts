import { describe, expect, it } from "vitest";

import {
  createRedirectRules,
  serializeRedirectFile,
} from "@/lib/redirects/generator";
import type { RedirectConfiguration } from "@/lib/redirects/types";
import { redirectsConfig } from "@/redirects.config";

describe("redirect configuration", () => {
  it("expands article mappings for both trailing-slash variants", () => {
    const rules = createRedirectRules({
      paths: [],
      postSlugs: [{ from: "old-slug", to: "new-slug" }],
    });

    expect(rules).toEqual([
      { from: "/posts/old-slug", status: 301, to: "/posts/new-slug/" },
      { from: "/posts/old-slug/", status: 301, to: "/posts/new-slug/" },
    ]);
  });

  it("starts with no redirects to inherited content", () => {
    expect(redirectsConfig).toEqual({ paths: [], postSlugs: [] });
    expect(serializeRedirectFile(redirectsConfig)).not.toContain("/posts/");
  });

  it.each([
    {
      paths: [
        { from: "/old", to: "/new" },
        { from: "/old", to: "/other" },
      ],
      postSlugs: [],
    },
    {
      paths: [
        { from: "/old", to: "/new" },
        { from: "/new", to: "/final" },
      ],
      postSlugs: [],
    },
    {
      paths: [],
      postSlugs: [{ from: "same", to: "same" }],
    },
  ] satisfies readonly RedirectConfiguration[])(
    "rejects duplicate, chained or identical redirect mappings",
    (configuration) => {
      expect(() => createRedirectRules(configuration)).toThrow();
    },
  );
});
