"use client";

import { ArrowRight, ArrowRightLeft, Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";

import type { SiteLocale } from "@/lib/site-config";

import { Base64Error, decodeBase64, encodeBase64 } from "./codec";

const copy = {
  "zh-CN": {
    mode: "转换模式",
    encode: "编码",
    decode: "解码",
    text: "原始文本",
    base64: "Base64 文本",
    input: "输入",
    output: "结果",
    characters: "字符",
    example: "试用示例",
    clear: "清空",
    encodeAction: "编码为 Base64",
    decodeAction: "解码为文本",
    reverse: "反向转换",
    copy: "复制结果",
    copied: "已复制",
    textPlaceholder: "在这里输入或粘贴文本，支持中文与 emoji…",
    base64Placeholder: "在这里粘贴 Base64 文本…",
    outputPlaceholder: "转换结果将显示在这里",
    done: "转换完成。",
    copyFailed: "复制失败，请选中结果后手动复制。",
    invalid: "Base64 格式不正确，请检查字符和末尾的 = 填充。",
    invalidUtf8: "解码后的内容不是有效的 UTF-8 文本，此工具仅支持文本转换。",
  },
  en: {
    mode: "Conversion mode",
    encode: "Encode",
    decode: "Decode",
    text: "Plain text",
    base64: "Base64 text",
    input: "Input",
    output: "Output",
    characters: "characters",
    example: "Try an example",
    clear: "Clear",
    encodeAction: "Encode to Base64",
    decodeAction: "Decode to text",
    reverse: "Reverse conversion",
    copy: "Copy result",
    copied: "Copied",
    textPlaceholder: "Type or paste text here, including Unicode and emoji…",
    base64Placeholder: "Paste Base64 text here…",
    outputPlaceholder: "Your converted result will appear here",
    done: "Conversion complete.",
    copyFailed: "Could not copy. Select the result and copy it manually.",
    invalid: "Invalid Base64. Check the characters and trailing = padding.",
    invalidUtf8:
      "The decoded content is not valid UTF-8 text. This tool supports text only.",
  },
} as const;

export function Base64Workbench({ locale }: { readonly locale: SiteLocale }) {
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
      setOutput(encoding ? encodeBase64(input) : decodeBase64(input));
      setStatus(t.done);
    } catch (cause) {
      setError(
        cause instanceof Base64Error && cause.code === "invalid-utf8"
          ? t.invalidUtf8
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
    <section className="base64-workbench" aria-label="Base64">
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
              const example = "Hello, 世界! 👋";
              setInput(encoding ? example : encodeBase64(example));
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
            <label htmlFor="base64-input">
              {t.input}
              <span>{encoding ? t.text : t.base64}</span>
            </label>
          </div>
          <textarea
            id="base64-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              resetResult();
            }}
            placeholder={encoding ? t.textPlaceholder : t.base64Placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "base64-error" : undefined}
          />
          <div className="tool-editor-footer">
            <span>
              {Array.from(input).length} {t.characters}
            </span>
            <span>UTF-8</span>
          </div>
        </div>
        <div className="tool-editor tool-output">
          <div className="tool-editor-heading">
            <label htmlFor="base64-output">
              {t.output}
              <span>{encoding ? t.base64 : t.text}</span>
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
            id="base64-output"
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
        <p id="base64-error" className="tool-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
