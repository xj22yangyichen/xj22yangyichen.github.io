"use client";

import { ArrowRightLeft, GitCompareArrows, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { SiteLocale } from "@/lib/site-config";
import type { DiffLine, DiffResponse, DiffResult } from "./compare";

const copy = {
  "zh-CN": {
    before: "原始文本",
    after: "修改后文本",
    example: "试用示例",
    swap: "交换两侧",
    clear: "清空",
    compare: "对比文本",
    comparing: "正在对比…",
    results: "对比结果",
    same: "两段文本一致",
    beforePlaceholder: "在这里粘贴原始文本…",
    afterPlaceholder: "在这里粘贴修改后的文本…",
    characters: "字符",
    added: "新增",
    removed: "删除",
    lines: "行",
    unchanged: "相同",
    noNewline: "无末尾换行",
    newline: "有末尾换行",
    scroll: "文本差异，可横向滚动",
    tooLarge: "文本较长，请将每侧控制在 200,000 字符、5,000 行以内后重试。",
    failed: "本次对比未能完成，请缩小文本范围后重试。",
  },
  en: {
    before: "Original text",
    after: "Modified text",
    example: "Try an example",
    swap: "Swap sides",
    clear: "Clear",
    compare: "Compare texts",
    comparing: "Comparing…",
    results: "Comparison results",
    same: "The texts are identical",
    beforePlaceholder: "Paste the original text here…",
    afterPlaceholder: "Paste the modified text here…",
    characters: "characters",
    added: "Added",
    removed: "Removed",
    lines: "lines",
    unchanged: "Unchanged",
    noNewline: "No newline at end",
    newline: "Newline at end",
    scroll: "Text differences, scroll horizontally",
    tooLarge:
      "Please keep each text within 200,000 characters and 5,000 lines and try again.",
    failed:
      "Could not complete this comparison. Try a smaller section of text.",
  },
} as const;

function LineContent({
  line,
  locale,
}: {
  readonly line: DiffLine;
  readonly locale: SiteLocale;
}) {
  const t = copy[locale];
  return (
    <>
      <span
        className="diff-line-number"
        aria-label={`${t.lines} ${line.number}`}
      >
        {line.number}
      </span>
      <span
        className="diff-line-sign"
        aria-label={
          line.kind === "added"
            ? t.added
            : line.kind === "removed"
              ? t.removed
              : t.unchanged
        }
      >
        {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}
      </span>
      <code className="diff-line-text">
        {line.parts.map((part, index) =>
          part.changed ? (
            <mark key={index}>{part.text}</mark>
          ) : (
            <span key={index}>{part.text}</span>
          ),
        )}
        {(!line.hasNewline || line.endingChanged) && (
          <span
            className={`diff-ending${line.endingChanged ? " diff-ending-changed" : ""}`}
          >
            {line.hasNewline ? `↵ ${t.newline}` : `∅ ${t.noNewline}`}
          </span>
        )}
      </code>
    </>
  );
}

function Results({
  result,
  locale,
}: {
  readonly result: DiffResult;
  readonly locale: SiteLocale;
}) {
  const t = copy[locale];
  return (
    <section className="diff-results" aria-labelledby="diff-results-title">
      <div className="diff-results-heading">
        <h2 id="diff-results-title">{t.results}</h2>
        <p role="status" className="diff-summary">
          {result.identical ? (
            t.same
          ) : (
            <>
              <span className="diff-added-count">+{result.added}</span>{" "}
              <span className="diff-removed-count">-{result.removed}</span>
            </>
          )}
        </p>
      </div>
      {!result.identical && (
        <>
          <div className="diff-column-headings" aria-hidden="true">
            <span>{t.before}</span>
            <span>{t.after}</span>
          </div>
          <div
            className="diff-scroll"
            tabIndex={0}
            role="region"
            aria-label={t.scroll}
          >
            <div className="diff-table">
              {result.rows.map((row, index) => (
                <div
                  key={index}
                  className={`diff-row${row.before?.kind === "same" ? " diff-row-same" : ""}`}
                >
                  <div
                    className={`diff-cell diff-before ${row.before ? `diff-${row.before.kind}` : "diff-empty"}`}
                  >
                    {row.before && (
                      <LineContent line={row.before} locale={locale} />
                    )}
                  </div>
                  <div
                    className={`diff-cell diff-after ${row.after ? `diff-${row.after.kind}` : "diff-empty"}`}
                  >
                    {row.after && (
                      <LineContent line={row.after} locale={locale} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export function DiffWorkbench({ locale }: { readonly locale: SiteLocale }) {
  const t = copy[locale];
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const worker = useRef<Worker | null>(null);
  useEffect(() => () => worker.current?.terminate(), []);

  function invalidate() {
    worker.current?.terminate();
    worker.current = null;
    setBusy(false);
    setResult(null);
    setError("");
  }

  function compare() {
    invalidate();
    setBusy(true);
    try {
      const job = new Worker(new URL("./diff.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.current = job;
      job.onmessage = (event: MessageEvent<DiffResponse>) => {
        if (worker.current !== job) return;
        if ("result" in event.data) setResult(event.data.result);
        else setError(event.data.error === "too-large" ? t.tooLarge : t.failed);
        setBusy(false);
        job.terminate();
        worker.current = null;
      };
      job.onerror = () => {
        if (worker.current !== job) return;
        setError(t.failed);
        setBusy(false);
        job.terminate();
        worker.current = null;
      };
      job.postMessage({ before, after });
    } catch {
      invalidate();
      setError(t.failed);
    }
  }

  return (
    <section className="diff-workbench" aria-label={t.compare}>
      <div className="tool-toolbar diff-toolbar">
        <div className="tool-secondary-actions">
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              invalidate();
              setBefore(
                'const count = 10;\nconst title = "Hello";\nconsole.log(count);\n',
              );
              setAfter(
                'const count = 20;\nconst title = "你好 👋";\nconst active = true;\nconsole.log(count);\n',
              );
            }}
          >
            {t.example}
          </button>
          <button
            type="button"
            className="tool-button"
            disabled={!before && !after}
            onClick={() => {
              invalidate();
              setBefore(after);
              setAfter(before);
            }}
          >
            <ArrowRightLeft aria-hidden="true" />
            {t.swap}
          </button>
          <button
            type="button"
            className="tool-button"
            disabled={!before && !after}
            onClick={() => {
              invalidate();
              setBefore("");
              setAfter("");
            }}
          >
            <Trash2 aria-hidden="true" />
            {t.clear}
          </button>
        </div>
      </div>
      <div className="tool-editors">
        {(["before", "after"] as const).map((side) => {
          const value = side === "before" ? before : after;
          return (
            <div className="tool-editor" key={side}>
              <div className="tool-editor-heading">
                <label htmlFor={`diff-${side}`}>{t[side]}</label>
              </div>
              <textarea
                id={`diff-${side}`}
                value={value}
                onChange={(event) => {
                  invalidate();
                  (side === "before" ? setBefore : setAfter)(
                    event.target.value,
                  );
                }}
                placeholder={
                  side === "before" ? t.beforePlaceholder : t.afterPlaceholder
                }
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
              />
              <div className="tool-editor-footer">
                <span>
                  {Array.from(value).length} {t.characters}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="tool-convert-row">
        <button
          className="tool-button tool-primary"
          type="button"
          disabled={busy || (!before && !after)}
          onClick={compare}
        >
          <GitCompareArrows aria-hidden="true" />
          {busy ? t.comparing : t.compare}
        </button>
        <span className="tool-status" role="status">
          {busy ? t.comparing : ""}
        </span>
      </div>
      {error && (
        <p className="tool-error" role="alert">
          {error}
        </p>
      )}
      {result && <Results result={result} locale={locale} />}
    </section>
  );
}
