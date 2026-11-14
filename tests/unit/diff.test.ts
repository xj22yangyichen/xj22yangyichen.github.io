import { describe, expect, it } from "vitest";
import {
  compareTexts,
  DiffError,
  normalizeNewlines,
} from "@/features/tools/diff/compare";

describe("text differences", () => {
  it("aligns insertions without misidentifying following lines", () => {
    const result = compareTexts("a\nb\nc\n", "a\ninserted\nb\nc\n");
    expect(result).toMatchObject({ added: 1, removed: 0, identical: false });
    expect(
      result.rows.map((row) => [row.before?.number, row.after?.number]),
    ).toEqual([
      [1, 1],
      [undefined, 2],
      [2, 3],
      [3, 4],
    ]);
  });
  it("highlights changes inside replacement lines", () => {
    const result = compareTexts("const count = 10;\n", "const count = 20;\n");
    expect(result).toMatchObject({ added: 1, removed: 1 });
    expect(
      result.rows[0]?.before?.parts
        .filter((part) => part.changed)
        .map((part) => part.text)
        .join(""),
    ).toBe("1");
    expect(
      result.rows[0]?.after?.parts
        .filter((part) => part.changed)
        .map((part) => part.text)
        .join(""),
    ).toBe("2");
  });
  it("keeps Unicode grapheme clusters intact", () => {
    const result = compareTexts("你好 👩‍💻\n", "您好 👨‍💻\n");
    expect(result.rows[0]?.before?.parts).toContainEqual({
      text: "👩‍💻",
      changed: true,
    });
    expect(result.rows[0]?.after?.parts).toContainEqual({
      text: "👨‍💻",
      changed: true,
    });
  });
  it("normalizes line endings while retaining trailing newline differences", () => {
    expect(compareTexts("a\r\nb\r\n", "a\nb\n").identical).toBe(true);
    const result = compareTexts("a", "a\n");
    expect(result).toMatchObject({ added: 1, removed: 1, identical: false });
    expect(result.rows[0]?.before).toMatchObject({
      text: "a",
      hasNewline: false,
      endingChanged: true,
    });
    expect(result.rows[0]?.after).toMatchObject({
      text: "a",
      hasNewline: true,
      endingChanged: true,
    });
  });
  it("handles blank lines, whitespace and one-sided inputs", () => {
    expect(compareTexts("", "")).toMatchObject({ rows: [], identical: true });
    expect(compareTexts("", "a\n\n")).toMatchObject({ added: 2, removed: 0 });
    expect(compareTexts("a\n\n", "")).toMatchObject({ added: 0, removed: 2 });
    expect(compareTexts("a\n", "a\n\n")).toMatchObject({
      added: 1,
      removed: 0,
    });
    expect(compareTexts(" x\n", "x \n").identical).toBe(false);
    expect(compareTexts("\tx", "    x").identical).toBe(false);
  });
  it("reconstructs both inputs and maintains contiguous numbering", () => {
    const pairs = [
      ["a\nb\na\nb\n", "b\na\nc\nb\n"],
      ["a\nremove\nx\ny\ntail", "a\nnew\ntail\n"],
      ["\n\n", "\n"],
      ["<script>\r\n👋\r\n", "<img>\n你好\n"],
    ];
    let seed = 12345;
    const sample = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed;
    };
    for (let index = 0; index < 100; index++) {
      const generate = () =>
        Array.from(
          { length: sample() % 12 },
          () => ["a", "b", "", "你好", " x "][sample() % 5],
        ).join("\n");
      pairs.push([generate(), generate()]);
    }
    for (const [before, after] of pairs) {
      const result = compareTexts(before!, after!);
      for (const [side, source] of [
        ["before", before],
        ["after", after],
      ] as const) {
        const lines = result.rows.flatMap((row) =>
          row[side] ? [row[side]!] : [],
        );
        expect(
          lines
            .map((line) => line.text + (line.hasNewline ? "\n" : ""))
            .join(""),
        ).toBe(normalizeNewlines(source!));
        expect(lines.map((line) => line.number)).toEqual(
          lines.map((_, index) => index + 1),
        );
        for (const line of lines)
          expect(line.parts.map((part) => part.text).join("")).toBe(line.text);
      }
      expect(result.added).toBe(
        result.rows.filter((row) => row.after?.kind === "added").length,
      );
      expect(result.removed).toBe(
        result.rows.filter((row) => row.before?.kind === "removed").length,
      );
    }
  });
  it("rejects inputs exceeding practical rendering limits", () => {
    expect(() => compareTexts("x".repeat(200001), "")).toThrow(
      new DiffError("too-large"),
    );
    expect(() => compareTexts("", "x\n".repeat(5001))).toThrow(
      new DiffError("too-large"),
    );
  });
});
