"use client";

import { ArrowRight, ArrowRightLeft, Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";

import type { SiteLocale } from "@/lib/site-config";

import { AsciiError, decodeAscii, encodeAscii } from "./codec";

const copy = {
  "zh-CN": {
    mode: "转换模式",
    encode: "编码",
    decode: "解码",
    text: "原始文本",
    ascii: "ASCII 码",
    input: "输入",
    output: "结果",
    characters: "字符",
    example: "试用示例",
    clear: "清空",
    encodeAction: "编码为 ASCII",
    decodeAction: "解码为文本",
    reverse: "反向转换",
    copy: "复制结果",
    copied: "已复制",
    textPlaceholder: "在这里输入英文、数字或符号…",
    asciiPlaceholder: "例如：72 101 108 108 111（支持空格、换行或逗号分隔）",
    outputPlaceholder: "转换结果将显示在这里",
    done: "转换完成。",
    copyFailed: "复制失败，请选中结果后手动复制。",
    invalid: "请输入 0–127 的十进制整数，以空格、换行或逗号分隔。",
    nonAscii: "输入包含非 ASCII 字符，请使用英文、数字或半角符号。",
  },
  en: {
    mode: "Conversion mode",
    encode: "Encode",
    decode: "Decode",
    text: "Plain text",
    ascii: "ASCII codes",
    input: "Input",
    output: "Output",
    characters: "characters",
    example: "Try an example",
    clear: "Clear",
    encodeAction: "Encode to ASCII",
    decodeAction: "Decode to text",
    reverse: "Reverse conversion",
    copy: "Copy result",
    copied: "Copied",
    textPlaceholder: "Type or paste letters, numbers or symbols…",
    asciiPlaceholder: "e.g. 72 101 108 108 111 (spaces, line breaks or commas)",
    outputPlaceholder: "Your converted result will appear here",
    done: "Conversion complete.",
    copyFailed: "Could not copy. Select the result and copy it manually.",
    invalid:
      "Enter decimal integers from 0 to 127, separated by spaces, line breaks or commas.",
    nonAscii:
      "The input contains non-ASCII characters. Use English letters, numbers or ASCII symbols.",
  },
} as const;

export function AsciiWorkbench({ locale }: { readonly locale: SiteLocale }) {
  const t = copy[locale];
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const encoding = mode === "encode";

  function resetResult() {
    setOutput("");
    setError("");
    setStatus("");
    setCopied(false);
  }

  function convert() {
    resetResult();
    try {
      setOutput(encoding ? encodeAscii(input) : decodeAscii(input));
      setStatus(t.done);
    } catch (cause) {
      setError(
        cause instanceof AsciiError && cause.code === "non-ascii"
          ? t.nonAscii
          : t.invalid,
      );
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setStatus(t.copied);
    } catch {
      setStatus(t.copyFailed);
    }
  }

  return (
    <section className="ascii-workbench" aria-label="ASCII">
      <div className="tool-toolbar">
        <div className="tool-mode" role="group" aria-label={t.mode}>
          {(["encode", "decode"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                resetResult();
              }}
            >
              {t[value]}
            </button>
          ))}
        </div>
        <div className="tool-secondary-actions">
          <button
            className="tool-button"
            type="button"
            onClick={() => {
              const example = "Hello, World!";
              setInput(encoding ? example : encodeAscii(example));
              resetResult();
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
              resetResult();
            }}
          >
            <Trash2 aria-hidden="true" />
            {t.clear}
          </button>
        </div>
      </div>
      <div className="tool-editors">
        <div className="tool-editor">
          <div className="tool-editor-heading">
            <label htmlFor="ascii-input">
              {t.input}
              <span>{encoding ? t.text : t.ascii}</span>
            </label>
          </div>
          <textarea
            id="ascii-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              resetResult();
            }}
            placeholder={encoding ? t.textPlaceholder : t.asciiPlaceholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "ascii-error" : undefined}
          />
          <div className="tool-editor-footer">
            <span>
              {Array.from(input).length} {t.characters}
            </span>
            <span>ASCII</span>
          </div>
        </div>
        <div className="tool-editor tool-output">
          <div className="tool-editor-heading">
            <label htmlFor="ascii-output">
              {t.output}
              <span>{encoding ? t.ascii : t.text}</span>
            </label>
            <button
              type="button"
              className="tool-button"
              onClick={copyResult}
              disabled={!output}
            >
              {copied ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <textarea
            id="ascii-output"
            value={output}
            readOnly
            placeholder={t.outputPlaceholder}
            spellCheck={false}
          />
          <div className="tool-editor-footer">
            <span>
              {Array.from(output).length} {t.characters}
            </span>
            <button
              type="button"
              className="tool-button"
              disabled={!output}
              onClick={() => {
                setInput(output);
                setMode(encoding ? "decode" : "encode");
                resetResult();
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
          type="button"
          className="tool-button tool-primary"
          onClick={convert}
          disabled={!input}
        >
          {encoding ? t.encodeAction : t.decodeAction}
          <ArrowRight aria-hidden="true" />
        </button>
        <p className="tool-status" role="status">
          {status}
        </p>
      </div>
      {error ? (
        <p id="ascii-error" className="tool-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
