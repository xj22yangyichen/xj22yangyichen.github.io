"use client";

import { ArrowRightLeft, Copy } from "lucide-react";
import { useState } from "react";
import type { SiteLocale } from "@/lib/site-config";
import {
  dateToTimestamp,
  formatDateTime,
  timestampToDate,
  type TimestampUnit,
  type TimeZone,
} from "./convert";

const copy = {
  "zh-CN": {
    toDate: "时间戳转日期",
    toTimestamp: "日期转时间戳",
    mode: "转换模式",
    unit: "时间戳单位",
    seconds: "秒",
    milliseconds: "毫秒",
    zone: "日期时区",
    local: "本地时区（浏览器）",
    utc: "UTC",
    beijing: "北京时间（UTC+08:00）",
    now: "使用当前时间",
    clear: "清空",
    input: "输入",
    output: "结果",
    convert: "转换",
    timestamp: "Unix 时间戳",
    date: "日期时间",
    copy: "复制结果",
    reverse: "反向转换",
    copied: "已复制",
    done: "转换完成。",
    failed: "复制失败，请手动复制结果。",
    invalidTimestamp:
      "请输入有效时间戳：秒最多支持 3 位小数，毫秒须为整数；日期范围为 0001–9999 年。",
    invalidDate:
      "请输入有效日期时间，例如 2026-01-01 08:00:00.000；请检查日期与所选时区中该时间是否存在。",
    hint: "Unix 时间戳从 1970-01-01 00:00:00 UTC 起计算，与时区无关。时区仅用于解释或显示日期；秒支持 3 位小数以保留毫秒。",
    dst: "本地时区使用浏览器的时区规则；夏令时回拨时重复出现的时间取较早的一次。",
    placeholder: "转换结果将显示在这里",
  },
  en: {
    toDate: "Timestamp to date",
    toTimestamp: "Date to timestamp",
    mode: "Conversion mode",
    unit: "Timestamp unit",
    seconds: "Seconds",
    milliseconds: "Milliseconds",
    zone: "Date time zone",
    local: "Local (browser)",
    utc: "UTC",
    beijing: "Beijing (UTC+08:00)",
    now: "Use current time",
    clear: "Clear",
    input: "Input",
    output: "Result",
    convert: "Convert",
    timestamp: "Unix timestamp",
    date: "Date and time",
    copy: "Copy result",
    reverse: "Reverse conversion",
    copied: "Copied",
    done: "Conversion complete.",
    failed: "Could not copy. Copy the result manually.",
    invalidTimestamp:
      "Enter a valid timestamp: seconds allow up to 3 decimal places; milliseconds must be integers. Supported years: 0001–9999.",
    invalidDate:
      "Enter a valid date, e.g. 2026-01-01 08:00:00.000. Check the calendar date and whether this time exists in the selected zone.",
    hint: "Unix timestamps count from 1970-01-01 00:00:00 UTC, independently of time zones. The zone only interprets or displays dates. Seconds allow 3 decimal places to preserve milliseconds.",
    dst: "Local time follows your browser’s time zone rules. Repeated times during daylight saving fallback use the earlier occurrence.",
    placeholder: "Your converted result will appear here",
  },
} as const;

export function TimestampWorkbench({
  locale,
}: {
  readonly locale: SiteLocale;
}) {
  const t = copy[locale];
  const [mode, setMode] = useState<"toDate" | "toTimestamp">("toDate");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [zone, setZone] = useState<TimeZone>("local");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const toDate = mode === "toDate";
  function reset() {
    setOutput("");
    setError("");
    setStatus("");
  }
  function convert() {
    reset();
    try {
      setOutput(
        toDate
          ? timestampToDate(input, unit, zone)
          : dateToTimestamp(input, unit, zone),
      );
      setStatus(t.done);
    } catch {
      setError(toDate ? t.invalidTimestamp : t.invalidDate);
    }
  }
  return (
    <section className="timestamp-workbench" aria-label={t.timestamp}>
      <div className="tool-toolbar">
        <div className="tool-mode" role="group" aria-label={t.mode}>
          {(["toDate", "toTimestamp"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                setInput("");
                reset();
              }}
            >
              {t[value]}
            </button>
          ))}
        </div>
        <div className="tool-secondary-actions">
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              const now = new Date();
              setInput(
                toDate
                  ? String(
                      unit === "seconds" ? now.getTime() / 1000 : now.getTime(),
                    )
                  : formatDateTime(now, zone),
              );
              reset();
            }}
          >
            {t.now}
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
            {t.clear}
          </button>
        </div>
      </div>
      <div className="tool-toolbar">
        <label className="matrix-precision">
          {t.unit}
          <select
            value={unit}
            onChange={(event) => {
              setUnit(event.target.value as TimestampUnit);
              reset();
            }}
          >
            <option value="seconds">{t.seconds}</option>
            <option value="milliseconds">{t.milliseconds}</option>
          </select>
        </label>
        <label className="matrix-precision">
          {t.zone}
          <select
            value={zone}
            onChange={(event) => {
              setZone(event.target.value as TimeZone);
              reset();
            }}
          >
            {(["local", "utc", "beijing"] as const).map((value) => (
              <option key={value} value={value}>
                {t[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="matrix-hint">{t.hint}</p>
      {zone === "local" && <p className="matrix-hint">{t.dst}</p>}
      <div className="tool-editors">
        <div className="tool-editor">
          <div className="tool-editor-heading">
            <label htmlFor="timestamp-input">
              {t.input}
              <span>{toDate ? t.timestamp : t.date}</span>
            </label>
          </div>
          <textarea
            id="timestamp-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              reset();
            }}
            placeholder={
              toDate
                ? unit === "seconds"
                  ? "1767225600"
                  : "1767225600000"
                : "2026-01-01 08:00:00.000"
            }
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "timestamp-error" : undefined}
          />
          <div className="tool-editor-footer">{toDate ? t[unit] : t[zone]}</div>
        </div>
        <div className="tool-editor tool-output">
          <div className="tool-editor-heading">
            <label htmlFor="timestamp-output">
              {t.output}
              <span>{toDate ? t.date : t.timestamp}</span>
            </label>
            <button
              type="button"
              className="tool-button"
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
            id="timestamp-output"
            value={output}
            readOnly
            placeholder={t.placeholder}
            spellCheck={false}
          />
          <div className="tool-editor-footer">
            <span>{toDate ? t[zone] : t[unit]}</span>
            <button
              type="button"
              className="tool-button"
              disabled={!output}
              onClick={() => {
                setInput(output);
                setMode(toDate ? "toTimestamp" : "toDate");
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
          type="button"
          className="tool-button tool-primary"
          disabled={!input.trim()}
          onClick={convert}
        >
          {t.convert}
        </button>
        <p className="tool-status" role="status">
          {status}
        </p>
      </div>
      {error && (
        <p id="timestamp-error" className="tool-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
