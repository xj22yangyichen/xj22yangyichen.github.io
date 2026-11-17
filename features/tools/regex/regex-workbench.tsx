"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { SiteLocale } from "@/lib/site-config";

import type { RegexInput, RegexResult } from "./regex.worker";

const copy = {
  "zh-CN": {
    pattern: "正则表达式",
    flags: "标志（可选）",
    hint: "直接输入表达式，例如 \\d+。要匹配整个字符串，可以使用 ^ 和 $，例如 ^\\d+$。",
    input: "待测字符串",
    example: "试用示例",
    clear: "清空",
    test: "检查匹配",
    testing: "正在匹配…",
    matched: "匹配成功。",
    unmatched: "未匹配。",
    invalid: "正则表达式或标志无效，请检查语法。",
    timedOut: "匹配超时，请简化表达式或缩短字符串。",
    failed: "匹配未完成，请重试。",
  },
  en: {
    pattern: "Regular expression",
    flags: "Flags (optional)",
    hint: "Enter a pattern such as \\d+. To match the entire string, you can use ^ and $, as in ^\\d+$.",
    input: "Test string",
    example: "Try an example",
    clear: "Clear",
    test: "Test match",
    testing: "Testing…",
    matched: "Match found.",
    unmatched: "No match.",
    invalid: "Invalid regular expression or flags. Check the syntax.",
    timedOut: "The match timed out. Try a simpler pattern or a shorter string.",
    failed: "The match could not complete. Please try again.",
  },
} as const;

const emptyInput: RegexInput = { pattern: "", flags: "", text: "" };
const exampleInput: RegexInput = {
  pattern: "^order-\\d+$",
  flags: "i",
  text: "Order-123",
};
const matchTimeoutMs = 2000;

type Status = RegexResult | "idle" | "testing" | "timedOut";

export function RegexWorkbench({ locale }: { readonly locale: SiteLocale }) {
  const t = copy[locale];
  const [input, setInput] = useState(emptyInput);
  const [status, setStatus] = useState<Status>("idle");
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => stopRef.current?.(), []);

  function updateInput(nextInput: RegexInput) {
    stopRef.current?.();
    setInput(nextInput);
    setStatus("idle");
  }

  function testMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopRef.current?.();
    setStatus("testing");

    try {
      const worker = new Worker(new URL("./regex.worker.ts", import.meta.url));
      const timeout = window.setTimeout(
        () => finish("timedOut"),
        matchTimeoutMs,
      );

      function stop() {
        window.clearTimeout(timeout);
        worker.terminate();
        stopRef.current = null;
      }

      function finish(result: Status) {
        if (stopRef.current !== stop) return;
        stop();
        setStatus(result);
      }

      stopRef.current = stop;
      worker.onmessage = ({ data }: MessageEvent<RegexResult>) => finish(data);
      worker.onerror = () => finish("failed");
      worker.postMessage(input);
    } catch {
      stopRef.current?.();
      setStatus("failed");
    }
  }

  const hasError =
    status === "invalid" || status === "timedOut" || status === "failed";

  return (
    <form className="regex-workbench" onSubmit={testMatch}>
      <div className="tool-toolbar">
        <div className="tool-secondary-actions">
          <button
            type="button"
            className="tool-button"
            onClick={() => updateInput(exampleInput)}
          >
            {t.example}
          </button>
          <button
            type="button"
            className="tool-button"
            onClick={() => updateInput(emptyInput)}
          >
            {t.clear}
          </button>
        </div>
      </div>
      <div className="regex-controls">
        <label htmlFor="regex-pattern">
          {t.pattern}
          <input
            id="regex-pattern"
            value={input.pattern}
            onChange={(event) =>
              updateInput({ ...input, pattern: event.target.value })
            }
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby={
              status === "invalid" ? "regex-hint regex-error" : "regex-hint"
            }
          />
        </label>
        <label htmlFor="regex-flags">
          {t.flags}
          <input
            id="regex-flags"
            value={input.flags}
            onChange={(event) =>
              updateInput({ ...input, flags: event.target.value })
            }
            placeholder="i"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </label>
      </div>
      <p id="regex-hint" className="regex-hint">
        {t.hint}
      </p>
      <div className="tool-editor">
        <div className="tool-editor-heading">
          <label htmlFor="regex-input">{t.input}</label>
        </div>
        <textarea
          id="regex-input"
          value={input.text}
          onChange={(event) =>
            updateInput({ ...input, text: event.target.value })
          }
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
      <div className="tool-convert-row">
        <button
          type="submit"
          className="tool-button tool-primary"
          disabled={status === "testing"}
        >
          {t.test}
        </button>
        <p className="regex-status" role="status">
          {status === "idle" || hasError ? "" : t[status]}
        </p>
      </div>
      {hasError && (
        <p id="regex-error" className="tool-error" role="alert">
          {t[status]}
        </p>
      )}
    </form>
  );
}
