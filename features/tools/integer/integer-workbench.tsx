"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteLocale } from "@/lib/site-config";
import { integerTools, type IntegerOperation } from "../registry";
import type { IntegerResponse } from "./integer.worker";

const copy = {
  "zh-CN": {
    input: "输入整数",
    output: "结果",
    example: "试用示例",
    clear: "清空",
    prime: "判断质数",
    factor: "分解质因数",
    cancel: "取消计算",
    busy: "正在计算…",
    hint: "请输入十进制非负整数，最大为 2^60 = 1152921504606846976（含）。不支持小数、科学计数法或算式。",
    placeholder: "例如：1000000016000000063",
    result: "计算结果将显示在这里",
    isPrime: "是质数。",
    composite: "是合数。",
    neither: "既不是质数，也不是合数。",
    done: "计算完成。",
    cancelled: "已取消计算。",
    copy: "复制结果",
    copied: "已复制",
    copyFailed: "复制失败，请选中结果后手动复制。",
    invalid: "请输入仅由数字组成的非负整数。",
    range: "数字不能超过 1152921504606846976（2^60）。",
    noFactors: "0 和 1 没有质因数分解，请输入不小于 2 的整数。",
    failed: "计算未完成，请重试。",
  },
  en: {
    input: "Integer input",
    output: "Result",
    example: "Try an example",
    clear: "Clear",
    prime: "Test primality",
    factor: "Factor into primes",
    cancel: "Cancel calculation",
    busy: "Calculating…",
    hint: "Enter a non-negative decimal integer up to 2^60 = 1152921504606846976 (inclusive). Decimals, scientific notation and expressions are not supported.",
    placeholder: "For example: 1000000016000000063",
    result: "Your result will appear here",
    isPrime: "is prime.",
    composite: "is composite.",
    neither: "is neither prime nor composite.",
    done: "Calculation complete.",
    cancelled: "Calculation cancelled.",
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Could not copy. Select the result and copy it manually.",
    invalid: "Enter a non-negative integer using digits only.",
    range: "The number must not exceed 1152921504606846976 (2^60).",
    noFactors:
      "0 and 1 have no prime factorization. Enter an integer of at least 2.",
    failed: "Calculation failed. Please try again.",
  },
} as const;

export function IntegerWorkbench({
  locale,
  operation,
}: {
  readonly locale: SiteLocale;
  readonly operation: IntegerOperation;
}) {
  const t = copy[locale];
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  useEffect(() => () => workerRef.current?.terminate(), []);

  function stop() {
    workerRef.current?.terminate();
    workerRef.current = null;
    setBusy(false);
  }

  function reset(value: string) {
    stop();
    setInput(value);
    setOutput("");
    setError("");
    setStatus("");
  }

  function calculate() {
    reset(input);
    setBusy(true);
    setStatus(t.busy);
    try {
      const worker = new Worker(
        new URL("./integer.worker.ts", import.meta.url),
      );
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<IntegerResponse>) => {
        if (workerRef.current !== worker) return;
        stop();
        const response = event.data;
        if ("error" in response) {
          setError(
            response.error === "invalid-integer"
              ? t.invalid
              : response.error === "out-of-range"
                ? t.range
                : response.error === "no-factorization"
                  ? t.noFactors
                  : t.failed,
          );
          setStatus("");
          return;
        }
        setOutput(
          response.factors !== undefined
            ? `${response.value} = ${response.factors}`
            : `${response.value} ${response.prime ? t.isPrime : response.value === "0" || response.value === "1" ? t.neither : t.composite}`,
        );
        setStatus(t.done);
      };
      worker.onerror = () => {
        if (workerRef.current !== worker) return;
        stop();
        setError(t.failed);
        setStatus("");
      };
      worker.postMessage({ input, operation });
    } catch {
      stop();
      setError(t.failed);
      setStatus("");
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus(t.copied);
    } catch {
      setStatus(t.copyFailed);
    }
  }

  return (
    <section
      className="integer-workbench"
      aria-label={integerTools[operation].title[locale]}
    >
      <p className="matrix-hint" id="integer-hint">
        {t.hint}
      </p>
      <div className="tool-toolbar">
        <div className="tool-secondary-actions">
          <button
            type="button"
            className="tool-button"
            onClick={() =>
              reset(
                operation === "prime"
                  ? "1152921504606846883"
                  : "1000000016000000063",
              )
            }
          >
            {t.example}
          </button>
          <button
            type="button"
            className="tool-button"
            disabled={!input && !output && !busy}
            onClick={() => reset("")}
          >
            {t.clear}
          </button>
        </div>
      </div>
      <div className="tool-editors">
        <div className="tool-editor">
          <div className="tool-editor-heading">
            <label htmlFor="integer-input">{t.input}</label>
          </div>
          <textarea
            id="integer-input"
            inputMode="numeric"
            spellCheck={false}
            value={input}
            onChange={(event) => reset(event.target.value)}
            placeholder={t.placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? "integer-hint integer-error" : "integer-hint"
            }
          />
        </div>
        <div className="tool-editor tool-output" aria-busy={busy}>
          <div className="tool-editor-heading">
            <label htmlFor="integer-output">{t.output}</label>
            <button
              type="button"
              className="tool-button"
              disabled={!output}
              onClick={copyResult}
            >
              {t.copy}
            </button>
          </div>
          <textarea
            id="integer-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder={t.result}
          />
        </div>
      </div>
      <div className="tool-convert-row">
        <button
          type="button"
          className="tool-button tool-primary"
          disabled={!input.trim() || busy}
          onClick={calculate}
        >
          {t[operation]}
        </button>
        {busy && (
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              stop();
              setStatus(t.cancelled);
            }}
          >
            {t.cancel}
          </button>
        )}
        <p className="tool-status" role="status">
          {status}
        </p>
      </div>
      {error && (
        <p id="integer-error" className="tool-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
