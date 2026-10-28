import { describe, expect, it } from "vitest";
import {
  formatPostDate,
  formatPostDateTime,
} from "@/features/posts/post-links";
import { parseContentDate } from "@/lib/content/dates";
import { articleFrontmatterSchema } from "@/lib/content/schema";
import { sortArticles } from "@/lib/content/queries";
import { buildRssFeed } from "@/lib/seo/rss";
import { article } from "../fixtures/content";

describe("publication timestamps", () => {
  const published = "2023-09-09T10:17:09+08:00";

  it("retains offset and seconds while accepting existing date-only posts", () => {
    const sample = {
      title: "Example",
      description: "Description",
      locale: "zh-CN",
      tags: ["数学"],
    };
    expect(
      articleFrontmatterSchema.parse({ ...sample, published }).published,
    ).toBe(published);
    expect(
      articleFrontmatterSchema.safeParse({ ...sample, published: "2023-09-09" })
        .success,
    ).toBe(true);
    expect(
      articleFrontmatterSchema.safeParse({
        ...sample,
        published,
        updated: "2023-09-09T10:17:00+08:00",
      }).success,
    ).toBe(false);
  });

  it("keeps the source calendar date at midnight and shows the original time", () => {
    expect(formatPostDate("2023-09-09T00:17:09+08:00", "zh-CN")).toBe(
      "2023年9月9日",
    );
    expect(formatPostDateTime(published, "zh-CN")).toBe(
      "2023年9月9日 10:17:09 (UTC+08:00)",
    );
    expect(parseContentDate("2023-09-09").toISOString()).toBe(
      "2023-09-09T00:00:00.000Z",
    );
  });

  it("sorts and emits RSS by the actual instant across UTC offsets", () => {
    const earlier = article({
      slug: "earlier",
      published: "2023-09-09T10:00:00+08:00",
    });
    const later = article({ slug: "later", published: "2023-09-09T04:00:00Z" });
    expect(sortArticles([earlier, later]).map((entry) => entry.slug)).toEqual([
      "later",
      "earlier",
    ]);
    const feed = buildRssFeed([article({ published })], "zh-CN");
    expect(feed).toContain("Sat, 09 Sep 2023 02:17:09 GMT");
    expect(feed).not.toContain("Invalid Date");
  });
});
