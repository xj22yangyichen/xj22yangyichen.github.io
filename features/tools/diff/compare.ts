import { diffArrays } from "diff";

export interface DiffPart {
  readonly text: string;
  readonly changed: boolean;
}

export interface DiffLine {
  readonly number: number;
  readonly text: string;
  readonly kind: "same" | "removed" | "added";
  readonly parts: readonly DiffPart[];
  readonly hasNewline: boolean;
  readonly endingChanged: boolean;
}

export interface DiffRow {
  readonly before?: DiffLine;
  readonly after?: DiffLine;
}

export interface DiffResult {
  readonly rows: readonly DiffRow[];
  readonly added: number;
  readonly removed: number;
  readonly identical: boolean;
}

export type DiffFailure = "too-large" | "too-complex";
export type DiffResponse = { result: DiffResult } | { error: DiffFailure };

export class DiffError extends Error {
  constructor(readonly code: DiffFailure) {
    super(code);
    this.name = "DiffError";
  }
}

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/gu, "\n");
}

// Retain each line terminator, without inventing an extra line at EOF.
export function splitLines(text: string): string[] {
  return text.match(/[^\n]*\n|[^\n]+$/gu) ?? [];
}

function makeLine(
  value: string,
  number: number,
  kind: DiffLine["kind"],
): DiffLine {
  const hasNewline = value.endsWith("\n");
  const text = hasNewline ? value.slice(0, -1) : value;
  return {
    number,
    text,
    kind,
    parts: [{ text, changed: kind !== "same" }],
    hasNewline,
    endingChanged: false,
  };
}

function highlight(before: DiffLine, after: DiffLine): [DiffLine, DiffLine] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const segments = (text: string) =>
    Array.from(segmenter.segment(text), ({ segment }) => segment);
  const changes = diffArrays(segments(before.text), segments(after.text), {
    maxEditLength: 1000,
    timeout: 20,
  });
  const endingChanged = before.hasNewline !== after.hasNewline;
  if (!changes)
    return [
      { ...before, endingChanged },
      { ...after, endingChanged },
    ];
  return [
    {
      ...before,
      endingChanged,
      parts: changes
        .filter((change) => !change.added)
        .map((change) => ({
          text: change.value.join(""),
          changed: change.removed,
        })),
    },
    {
      ...after,
      endingChanged,
      parts: changes
        .filter((change) => !change.removed)
        .map((change) => ({
          text: change.value.join(""),
          changed: change.added,
        })),
    },
  ];
}

export function compareTexts(original: string, modified: string): DiffResult {
  if (original.length > 200_000 || modified.length > 200_000)
    throw new DiffError("too-large");
  const beforeText = normalizeNewlines(original);
  const afterText = normalizeNewlines(modified);
  const beforeLines = splitLines(beforeText);
  const afterLines = splitLines(afterText);
  if (beforeLines.length > 5000 || afterLines.length > 5000)
    throw new DiffError("too-large");
  const changes = diffArrays(beforeLines, afterLines, {
    maxEditLength: 6000,
    timeout: 2000,
  });
  if (!changes) throw new DiffError("too-complex");

  const rows: DiffRow[] = [];
  let oldNumber = 1;
  let newNumber = 1;
  let added = 0;
  let removed = 0;
  let pendingBefore: DiffLine[] = [];
  let pendingAfter: DiffLine[] = [];
  function flush() {
    for (
      let index = 0;
      index < Math.max(pendingBefore.length, pendingAfter.length);
      index++
    ) {
      let before = pendingBefore[index];
      let after = pendingAfter[index];
      if (before && after) [before, after] = highlight(before, after);
      rows.push({ before, after });
    }
    pendingBefore = [];
    pendingAfter = [];
  }
  for (const change of changes) {
    if (change.removed) {
      for (const value of change.value)
        pendingBefore.push(makeLine(value, oldNumber++, "removed"));
      removed += change.value.length;
    } else if (change.added) {
      for (const value of change.value)
        pendingAfter.push(makeLine(value, newNumber++, "added"));
      added += change.value.length;
    } else {
      flush();
      for (const value of change.value) {
        rows.push({
          before: makeLine(value, oldNumber++, "same"),
          after: makeLine(value, newNumber++, "same"),
        });
      }
    }
  }
  flush();
  return { rows, added, removed, identical: beforeText === afterText };
}
