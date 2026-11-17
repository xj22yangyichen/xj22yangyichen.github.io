"use client";

import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import type { SiteLocale } from "@/lib/site-config";
import {
  removeComments,
  validCommentRules,
  type CommentRules,
  type CodeLanguage,
} from "./remove-comments";

const languages = {
  cpp: "C/C++",
  rust: "Rust",
  python: "Python",
  go: "Go",
  java: "Java",
  javascript: "JavaScript",
  php: "PHP",
} as const;
const examples: Record<CodeLanguage, string> = {
  java: '// Example\nString url = "https://example.com"; /* URL */\n',
  javascript: "// Example\nconst url = `https://example.com`; /* URL */\n",
  php: '<?php\n$url = "https://example.com"; # URL\n',
  custom: "",
  cpp: '// Example\nconst char* url = "https://example.com"; // URL\nint/* count */ total = 3;\n',
  rust: '// Example\nlet url = r#"https://example.com"#;\n/* outer /* nested */ comment */\nlet total = 3;\n',
  python: '# Example\nurl = "https://example.com/#hello"  # URL\nprint(url)\n',
  go: "// Example\npackage main\n\nfunc main() {\n    url := `https://example.com` // URL\n    println(url)\n}\n",
};
const copy = {
  "zh-CN": {
    language: "代码语言",
    custom: "自定义注释规则",
    line: "单行注释开始符",
    blockStart: "多行注释开始符",
    blockEnd: "多行注释结束符",
    rulesHint:
      "按字面匹配注释符，保留引号内的内容。可留空禁用单行或多行注释；多行开始符和结束符需成对填写。",
    invalidRules:
      "请至少填写一种注释规则，多行开始符和结束符需成对填写，且不能包含换行。",
    input: "输入代码",
    output: "处理结果",
    action: "删除注释",
    example: "试用示例",
    clear: "清空",
    copy: "复制结果",
    copied: "已复制",
    placeholder: "在这里输入或粘贴代码…",
    result: "删除注释后的代码将显示在这里",
    hint: "保留换行、字符串和 Python 文档字符串；块注释替换为空格，避免代码粘连。",
    done: "注释删除完成。",
    invalidCode: "无法识别代码，请检查未闭合的字符串、正则表达式或注释。",
    failed: "复制失败，请选中结果后手动复制。",
  },
  en: {
    language: "Code language",
    custom: "Custom comment rules",
    line: "Line comment start",
    blockStart: "Block comment start",
    blockEnd: "Block comment end",
    rulesHint:
      "Delimiters are matched literally; quoted text is preserved. Leave a rule blank to disable it; block delimiters must be supplied as a pair.",
    invalidRules:
      "Enter at least one rule, supply block delimiters as a pair, and do not include line breaks.",
    input: "Input code",
    output: "Result",
    action: "Remove comments",
    example: "Try an example",
    clear: "Clear",
    copy: "Copy result",
    copied: "Copied",
    placeholder: "Type or paste your code here…",
    result: "Code without comments will appear here",
    hint: "Line breaks, strings and Python docstrings are preserved; block comments become spaces to keep tokens apart.",
    done: "Comments removed.",
    invalidCode:
      "Could not read the code. Check for unclosed strings, regular expressions or comments.",
    failed: "Could not copy. Select the result and copy it manually.",
  },
} as const;

export function CommentRemoverWorkbench({
  locale,
}: {
  readonly locale: SiteLocale;
}) {
  const t = copy[locale];
  const [language, setLanguage] = useState<CodeLanguage>("cpp");
  const [rules, setRules] = useState<CommentRules>({
    line: "//",
    blockStart: "/*",
    blockEnd: "*/",
  });
  const invalidRules = language === "custom" && !validCommentRules(rules);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  function reset() {
    setOutput("");
    setStatus("");
    setCopied(false);
  }
  async function copyResult() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setStatus(t.copied);
    } catch {
      setStatus(t.failed);
    }
  }
  return (
    <section className="comment-workbench" aria-label={t.action}>
      <div className="tool-toolbar">
        <div className="comment-rule-controls">
          <label className="tool-language" htmlFor="comment-language">
            {t.language}
            <select
              id="comment-language"
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value as CodeLanguage);
                reset();
              }}
            >
              {Object.entries(languages).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
              <option value="custom">{t.custom}</option>
            </select>
          </label>
          {language === "custom" &&
            (["line", "blockStart", "blockEnd"] as const).map((key) => (
              <label className="tool-language" key={key}>
                {t[key]}
                <input
                  type="text"
                  value={rules[key]}
                  placeholder={t[key]}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-describedby="comment-rules-hint"
                  onChange={(event) => {
                    setRules({ ...rules, [key]: event.target.value });
                    reset();
                  }}
                />
              </label>
            ))}
        </div>
        <div className="tool-secondary-actions">
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              setInput(
                language === "custom"
                  ? `${rules.line ? rules.line + " Example\n" : ""}value = "hello";${rules.blockStart && rules.blockEnd ? " " + rules.blockStart + " note " + rules.blockEnd : ""}\n`
                  : examples[language],
              );
              reset();
            }}
          >
            {t.example}
          </button>
          <button
            type="button"
            className="tool-button"
            disabled={!input && !output}
            onClick={() => {
              setInput("");
              reset();
            }}
          >
            <Trash2 aria-hidden="true" />
            {t.clear}
          </button>
        </div>
      </div>
      {language === "custom" && (
        <p className="matrix-hint" id="comment-rules-hint">
          {t.rulesHint}
        </p>
      )}
      {invalidRules && (
        <p className="tool-error" role="alert">
          {t.invalidRules}
        </p>
      )}
      <p className="matrix-hint">{t.hint}</p>
      <div className="tool-editors">
        <div className="tool-editor">
          <div className="tool-editor-heading">
            <label htmlFor="comment-input">{t.input}</label>
          </div>
          <textarea
            id="comment-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              reset();
            }}
            placeholder={t.placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
        <div className="tool-editor tool-output">
          <div className="tool-editor-heading">
            <label htmlFor="comment-output">{t.output}</label>
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
            id="comment-output"
            value={output}
            readOnly
            placeholder={t.result}
            spellCheck={false}
          />
        </div>
      </div>
      <div className="tool-convert-row">
        <button
          type="button"
          className="tool-button tool-primary"
          disabled={!input || invalidRules}
          onClick={() => {
            reset();
            try {
              setOutput(removeComments(input, language, rules));
              setStatus(t.done);
            } catch {
              setStatus(t.invalidCode);
            }
          }}
        >
          {t.action}
        </button>
        <p className="tool-status" role="status">
          {status}
        </p>
      </div>
    </section>
  );
}
