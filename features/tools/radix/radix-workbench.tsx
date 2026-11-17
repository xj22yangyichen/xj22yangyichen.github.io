"use client";

import { ArrowRightLeft, Copy } from "lucide-react";
import { useState } from "react";
import type { SiteLocale } from "@/lib/site-config";
import { convertRadix, RadixError } from "./convert";

const copy = {
  "zh-CN": {
    from: "输入进制",
    to: "输出进制",
    input: "输入数字",
    output: "转换结果",
    convert: "转换",
    swap: "交换进制",
    reverse: "反向转换",
    example: "试用示例",
    clear: "清空",
    copy: "复制结果",
    copied: "已复制",
    failed: "复制失败，请手动复制结果。",
    done: "转换完成。",
    truncated: "结果已截断至小数点后 32 位，属于近似值。",
    hint: "支持 2–36 进制；字母 A–Z 表示 10–35，不区分大小写。请直接输入数字，不加 0x、0b 等前缀，不使用科学计数法。整数精确转换，小数最多保留 32 位（截断）。输入最多 4096 个字符，内容仅在浏览器内处理。",
    invalid:
      "数字与输入进制不匹配。请检查每一位数字，可使用正负号和一个小数点。",
    length: "输入最多支持 4096 个字符。",
    base: "请选择 2–36 之间的进制。",
    placeholder: "例如：255.5 或 FF.8",
    result: "转换结果将显示在这里",
    common: { 2: "二进制", 8: "八进制", 10: "十进制", 16: "十六进制" },
  },
  en: {
    from: "Input base",
    to: "Output base",
    input: "Input number",
    output: "Result",
    convert: "Convert",
    swap: "Swap bases",
    reverse: "Reverse conversion",
    example: "Try an example",
    clear: "Clear",
    copy: "Copy result",
    copied: "Copied",
    failed: "Could not copy. Copy the result manually.",
    done: "Conversion complete.",
    truncated:
      "Result truncated to 32 fractional digits; this is an approximation.",
    hint: "Supports bases 2–36. Letters A–Z represent 10–35 and are case-insensitive. Enter digits without prefixes such as 0x or 0b, or scientific notation. Integers are exact; fractions are truncated after 32 digits. Maximum 4096 input characters. Everything is processed in your browser.",
    invalid:
      "The number does not match the input base. Check each digit; a sign and one decimal point are allowed.",
    length: "Input is limited to 4096 characters.",
    base: "Choose a base from 2 to 36.",
    placeholder: "e.g. 255.5 or FF.8",
    result: "Your converted result will appear here",
    common: { 2: "Binary", 8: "Octal", 10: "Decimal", 16: "Hexadecimal" },
  },
} as const;

export function RadixWorkbench({ locale }: { readonly locale: SiteLocale }) {
  const t = copy[locale];
  const [from, setFrom] = useState(10);
  const [to, setTo] = useState(16);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [truncated, setTruncated] = useState(false);
  function reset() {
    setOutput("");
    setError("");
    setStatus("");
    setTruncated(false);
  }
  function convert() {
    reset();
    try {
      const result = convertRadix(input, from, to);
      setOutput(result.value);
      setTruncated(result.truncated);
      setStatus(t.done);
    } catch (cause) {
      setError(
        cause instanceof RadixError && cause.code !== "input"
          ? t[cause.code]
          : t.invalid,
      );
    }
  }
  return (
    <section
      aria-label={locale === "en" ? "Number base converter" : "进制转换"}
    >
      <div className="tool-toolbar">
        <div className="tool-secondary-actions">
          {(["from", "to"] as const).map((field) => (
            <label className="tool-language" key={field}>
              {t[field]}
              <select
                value={field === "from" ? from : to}
                onChange={(event) => {
                  (field === "from" ? setFrom : setTo)(
                    Number(event.target.value),
                  );
                  reset();
                }}
              >
                {Array.from({ length: 35 }, (_, index) => index + 2).map(
                  (base) => (
                    <option value={base} key={base}>
                      {base}
                      {base in t.common
                        ? ` · ${t.common[base as keyof typeof t.common]}`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </label>
          ))}
          <button
            className="tool-button"
            type="button"
            onClick={() => {
              setFrom(to);
              setTo(from);
              reset();
            }}
          >
            <ArrowRightLeft aria-hidden="true" />
            {t.swap}
          </button>
        </div>
        <div className="tool-secondary-actions">
          <button
            className="tool-button"
            type="button"
            onClick={() => {
              setFrom(10);
              setTo(16);
              setInput("255.5");
              reset();
            }}
          >
            {t.example}
          </button>
          <button
            className="tool-button"
            type="button"
            disabled={!input && !output}
            onClick={() => {
              setInput("");
              reset();
            }}
          >
            {t.clear}
          </button>
        </div>
      </div>
      <p className="matrix-hint" id="radix-hint">
        {t.hint}
      </p>
      <div className="tool-editors">
        <div className="tool-editor">
          <div className="tool-editor-heading">
            <label htmlFor="radix-input">
              {t.input}
              <span>{from}</span>
            </label>
          </div>
          <textarea
            id="radix-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              reset();
            }}
            placeholder={t.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "radix-hint radix-error" : "radix-hint"}
          />
        </div>
        <div className="tool-editor tool-output">
          <div className="tool-editor-heading">
            <label htmlFor="radix-output">
              {t.output}
              <span>{to}</span>
            </label>
            <button
              className="tool-button"
              type="button"
              disabled={!output}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output);
                  setStatus(t.copied);
                } catch {
                  setStatus(t.failed);
                }
              }}
            >
              <Copy aria-hidden="true" />
              {t.copy}
            </button>
          </div>
          <textarea
            id="radix-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder={t.result}
          />
          <div className="tool-editor-footer">
            <span>{truncated ? "≈" : ""}</span>
            <button
              className="tool-button"
              type="button"
              disabled={!output || truncated || output.length > 4096}
              onClick={() => {
                setInput(output);
                setFrom(to);
                setTo(from);
                reset();
              }}
            >
              <ArrowRightLeft aria-hidden="true" />
              {t.reverse}
            </button>
          </div>
        </div>
      </div>
      <div className="tool-convert-row">
        <button
          className="tool-button tool-primary"
          type="button"
          disabled={!input.trim()}
          onClick={convert}
        >
          {t.convert}
        </button>
        <p className="tool-status" role="status">
          {status}
          {truncated ? ` ${t.truncated}` : ""}
        </p>
      </div>
      {error ? (
        <p id="radix-error" className="tool-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
