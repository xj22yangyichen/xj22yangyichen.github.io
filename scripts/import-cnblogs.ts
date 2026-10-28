import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";
import { format } from "prettier";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const blogUrl = "https://www.cnblogs.com/xj22yangyichen";
const overwrite = process.argv.includes("--overwrite");
const descriptions: Record<string, string> = {
  "19638493":
    "常用 Git commit 类型、含义与示例，包括 feat、fix、docs、style、refactor、perf、test、chore、ci、build 和 revert。",
  "17688982":
    "用数学公式计算多米诺骨牌密铺矩形棋盘的方案数，并附 POJ2411 Mondriaan's Dream 的 C++ 实现。",
  "17013995":
    "介绍生活中常见的逻辑谬误，结合定义和实例，供学习参考，也可作为生活中的防骗指南。",
  "16947247":
    "介绍 STL 函数复杂度、前置自增、位运算、表达式化简等 C++ 常数优化方法，并附代码示例。",
  "16947240":
    "介绍 union、数组模拟容器、条件判断等能显著提升代码运行速度的 C++ 常数优化方法。",
  "16947230":
    "介绍 C++ 头文件 <numeric> 中的累加、内积、相邻差、前缀和与 iota 等实用函数。",
  "16947209":
    "介绍 C++ valarray 的初始化、运算、数学函数、切片和常用操作，并附完整代码示例。",
};
const cacheIndex = process.argv.indexOf("--cache-dir");
const cacheDirectory =
  cacheIndex >= 0 ? process.argv[cacheIndex + 1] : undefined;
if (cacheIndex >= 0 && !cacheDirectory)
  throw new Error("Missing cache directory");

function children(node: Node): Node[] {
  return "childNodes" in node ? node.childNodes : [];
}

function elements(
  node: Node,
  predicate: (element: Element) => boolean,
): Element[] {
  return [
    ...("tagName" in node && predicate(node) ? [node] : []),
    ...children(node).flatMap((child) => elements(child, predicate)),
  ];
}

function attribute(node: Element, name: string): string {
  return node.attrs.find((entry) => entry.name === name)?.value ?? "";
}

function byId(node: Node, id: string): Element {
  const match = elements(node, (element) => attribute(element, "id") === id)[0];
  if (!match) throw new Error(`Missing source element: ${id}`);
  return match;
}

function text(node: Node): string {
  return "value" in node && node.nodeName === "#text"
    ? node.value
    : children(node).map(text).join("");
}

function escapeText(value: string): string {
  return value.replace(/\s+/gu, " ").replace(/[\\`*_[\]<>]/gu, "\\$&");
}

function markdown(node: Node): string {
  if (!("tagName" in node)) return escapeText(text(node));
  const tag = node.tagName;
  const classes = attribute(node, "class").split(" ");
  if (classes.includes("math")) {
    const formula = text(node).trim();
    return classes.includes("display")
      ? `\n\n$$\n${formula.replace(/^\\\[|\\\]$/gu, "").trim()}\n$$\n\n`
      : `$${formula.replace(/^\\\(|\\\)$/gu, "")}$`;
  }
  if (tag === "pre") {
    const code = elements(node, (element) => element.tagName === "code")[0];
    if (!code) throw new Error("Source pre block is missing code");
    const language =
      attribute(code, "class").match(/language-([\w+-]+)/u)?.[1] ?? "";
    const value = text(code).replace(/\n$/u, "");
    const fence = "`".repeat(
      Math.max(3, ...[...value.matchAll(/`+/gu)].map((m) => m[0].length + 1)),
    );
    return `\n\n${fence}${language}\n${value}\n${fence}\n\n`;
  }
  if (tag === "table") {
    const rows = elements(node, (element) => element.tagName === "tr").map(
      (row) =>
        children(row)
          .filter(
            (cell): cell is Element =>
              "tagName" in cell && ["th", "td"].includes(cell.tagName),
          )
          .map((cell) =>
            children(cell).map(markdown).join("").trim().replaceAll("|", "\\|"),
          ),
    );
    if (!rows.length) throw new Error("Empty source table");
    const lines = rows.map((row) => `| ${row.join(" | ")} |`);
    lines.splice(1, 0, `| ${rows[0]!.map(() => "---").join(" | ")} |`);
    return `\n\n${lines.join("\n")}\n\n`;
  }
  const content = children(node).map(markdown).join("");
  if (/^h[1-6]$/u.test(tag))
    return `\n\n${"#".repeat(Number(tag[1]))} ${content.trim()}\n\n`;
  if (tag === "p" || tag === "div" || tag === "details")
    return `\n\n${content.trim()}\n\n`;
  if (tag === "summary" || tag === "strong" || tag === "b")
    return `**${content.trim()}**`;
  if (tag === "em" || tag === "i") return `*${content.trim()}*`;
  if (tag === "blockquote")
    return `\n\n${content
      .trim()
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")}\n\n`;
  if (tag === "br") return "  \n";
  if (tag === "hr") return "\n\n---\n\n";
  if (tag === "a")
    return `[${content.trim()}](${new URL(attribute(node, "href"), blogUrl).href})`;
  if (tag === "code") {
    const value = text(node);
    const fence = "`".repeat(
      Math.max(1, ...[...value.matchAll(/`+/gu)].map((m) => m[0].length + 1)),
    );
    return `${fence}${value}${fence}`;
  }
  if (["thead", "tbody", "tr", "th", "td", "span"].includes(tag))
    return content;
  throw new Error(`Unsupported source element: ${tag}`);
}

async function source(name: string, url: string): Promise<string> {
  if (cacheDirectory) return readFile(path.join(cacheDirectory, name), "utf8");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.text();
}

function normalize(value: string): string {
  return value.replace(/\\[()[\]]/gu, "").replace(/\s+/gu, "");
}

async function main() {
  const stats = await source("stats.html", `${blogUrl}/ajax/BlogStats`);
  const essayCount = Number(stats.match(/随笔 - (\d+)/u)?.[1]);
  const articleCount = Number(stats.match(/文章 - (\d+)/u)?.[1]);
  const listing = parse(await source("posts.html", `${blogUrl}/p/`));
  const links = elements(listing, (element) =>
    attribute(element, "id").startsWith("PostsList1_rpPosts_TitleUrl_"),
  );
  if (!essayCount || links.length !== essayCount)
    throw new Error(
      "Essay inventory does not match the source count; check pagination.",
    );
  const records = [];

  for (const link of links) {
    const originalUrl = attribute(link, "href");
    const id = originalUrl.match(/\/p\/(\d+)(?:\.html)?$/u)?.[1];
    if (!id) throw new Error(`Unexpected essay URL: ${originalUrl}`);
    const html = await source(`${id}.html`, originalUrl);
    if (!/cb_postType\s*=\s*1\b/u.test(html))
      throw new Error(`${id} is not an essay`);
    const document = parse(html);
    const body = byId(document, "cnblogs_post_body");
    const sourceMetadata = cacheDirectory
      ? await source(`${id}.tags.html`, "")
      : (
          JSON.parse(
            await source(
              `${id}.json`,
              `${blogUrl}/ajax/post-accessories?postId=${id}`,
            ),
          ) as { categoriesTags: string }
        ).categoriesTags;
    const metadata = parseFragment(sourceMetadata);
    const categories = elements(
      byId(metadata, "BlogPostCategory"),
      (element) => element.tagName === "a",
    ).map(text);
    const originalTags = elements(
      byId(metadata, "EntryTag"),
      (element) =>
        element.tagName === "a" && attribute(element, "href").includes("/tag/"),
    ).map(text);
    const tags = [...new Set([...categories, ...originalTags])];
    const published = elements(
      document,
      (element) =>
        attribute(element, "property") === "bytedance:published_time",
    ).map((element) => attribute(element, "content"))[0];
    const structured = elements(
      document,
      (element) => attribute(element, "type") === "application/ld+json",
    )[0];
    if (!published || !structured) throw new Error(`Missing dates for ${id}`);
    const sourceUpdated = (
      JSON.parse(text(structured).replaceAll("&#x2B;", "+")) as {
        dateModified: string;
      }
    ).dateModified.replace(/\.0+(?=[+Z-])/u, "");
    // CNBlogs rounds dateModified to minutes, sometimes before datePublished.
    const updated =
      Date.parse(sourceUpdated) >= Date.parse(published)
        ? sourceUpdated
        : undefined;
    const converted = await format(
      children(body).map(markdown).join("").trim(),
      { parser: "markdown", proseWrap: "preserve" },
    );
    const tree = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .parse(converted);
    const codeBlocks: string[] = [];
    const leafText: string[] = [];
    visit(tree, (node) => {
      if (node.type === "code") codeBlocks.push(node.value);
      if ("value" in node && typeof node.value === "string")
        leafText.push(node.value);
    });
    const sourceCode = elements(
      body,
      (element) => element.tagName === "pre",
    ).map((element) => text(element).replace(/\n$/u, ""));
    // Markdown formatting removes trailing spaces from sample output lines.
    const canonicalCode = (value: string) => value.replace(/[ \t]+$/gmu, "");
    if (
      JSON.stringify(sourceCode.map(canonicalCode)) !==
      JSON.stringify(codeBlocks.map(canonicalCode))
    )
      throw new Error(`Code changed while converting ${id}`);
    if (normalize(text(body)) !== normalize(leafText.join("")))
      throw new Error(`Body text changed while converting ${id}`);
    const title = text(byId(document, "cb_post_title_url")).trim();
    const description = descriptions[id] ?? title;
    const slug = `cnblogs-${id}`;
    const destination = `content/posts/zh/${slug}.md`;
    const output = await format(
      `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\npublished: ${JSON.stringify(published)}\n${updated ? `updated: ${JSON.stringify(updated)}\n` : ""}locale: zh-CN\ntags: ${JSON.stringify(tags)}\ndraft: false\n---\n\n${converted}`,
      { parser: "markdown", proseWrap: "preserve" },
    );
    let existing: string | undefined;
    try {
      existing = await readFile(destination, "utf8");
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
    if (!overwrite && existing !== undefined && existing !== output)
      throw new Error(`Refusing to overwrite edited content: ${destination}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, output);
    records.push({
      id,
      title,
      originalUrl,
      destination,
      published,
      sourceUpdated,
      ...(updated ? { updated } : {}),
      categories,
      originalTags,
      tags,
      codeBlocks: codeBlocks.length,
      sourceTextSha256: createHash("sha256")
        .update(normalize(text(body)))
        .digest("hex"),
    });
  }
  await mkdir("migrations/cnblogs", { recursive: true });
  await writeFile(
    "migrations/cnblogs/manifest.json",
    await format(
      JSON.stringify({
        blogUrl,
        essayCount,
        excludedArticleCount: articleCount,
        tagMapping:
          "Original categories and tags are merged into the new blog's tags.",
        records,
      }),
      { parser: "json" },
    ),
  );
  console.log(
    `Imported ${records.length} essays; excluded ${articleCount} articles. Body text and every code block match the source.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
