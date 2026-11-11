import { describe, expect, it } from "vitest";

import { readGiscusConfig, resolveGiscusConfig } from "@/lib/giscus/config";

const completeSettings = {
  category: "General",
  categoryId: "DIC_example",
  repo: "example/blog",
  repoId: "R_example123",
} as const;

describe("Giscus configuration", () => {
  it("allows comments to be disabled independently of repository settings", () => {
    expect(
      resolveGiscusConfig({ enabled: false, ...completeSettings }),
    ).toBeNull();
  });

  it("loads the configured production discussion repository", () => {
    expect(readGiscusConfig(false)).toEqual({
      repo: "xj22yangyichen/Blog-Comments",
      repoId: "R_kgDOVqAo6A",
      category: "Comments",
      categoryId: "DIC_kwDOVqAo6M4DK2Z4",
    });
  });

  it("accepts an enabled central setting", () => {
    expect(resolveGiscusConfig({ enabled: true, ...completeSettings })).toEqual(
      {
        category: "General",
        categoryId: "DIC_example",
        repo: "example/blog",
        repoId: "R_example123",
      },
    );
  });

  it("provides a complete isolated Playwright fixture", () => {
    expect(readGiscusConfig(true)).toEqual({
      category: "General",
      categoryId: "DIC_test",
      repo: "example/blog",
      repoId: "R_test",
    });
  });

  it("rejects malformed enabled settings", () => {
    expect(() =>
      resolveGiscusConfig({
        enabled: true,
        ...completeSettings,
        repo: "missing-owner",
      }),
    ).toThrow("incomplete or invalid");
  });
});
