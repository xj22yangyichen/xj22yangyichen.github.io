"use client";

import { useEffect, useRef, useState } from "react";
import { FileSearch, Upload } from "lucide-react";
import type { SiteLocale } from "@/lib/site-config";
import { extensionStatus, type Detection } from "./detect";

const copy = {
  "zh-CN": {
    choose: "选择文件",
    drop: "选择或拖放一个文件",
    privacy: "仅在浏览器本地识别，文件不会上传到服务器。",
    hint: "支持常见图片、音视频、压缩包、PDF 与 Office 文档等。",
    busy: "正在识别…",
    clear: "清空",
    name: "文件名",
    size: "文件大小",
    type: "识别类型",
    ext: "建议后缀",
    basis: "识别依据",
    signature: "文件内容特征",
    text: "文本内容推测（最多检查前 64 KB）",
    unknown: "无法确定类型",
    empty: "空文件，无法判断类型",
    unknownHint: "文件可能已损坏，或属于尚不支持的格式。不会根据后缀猜测类型。",
    match: "当前后缀与识别结果一致。",
    mismatch: "当前后缀与识别结果不一致，请参考建议后缀。",
    missing: "文件没有后缀，可以参考建议后缀。",
    uncertain: "文本可能属于多种格式，无法确认当前后缀是否正确。",
    error: "无法完成识别，请重新选择文件。",
    timeout: "识别超时，文件可能过于复杂或已损坏。",
    single: "请一次选择一个文件。",
  },
  en: {
    choose: "Choose a file",
    drop: "Choose or drop one file",
    privacy: "Processed locally in your browser. Files are never uploaded.",
    hint: "Supports common images, audio, video, archives, PDF and Office documents.",
    busy: "Detecting…",
    clear: "Clear",
    name: "Filename",
    size: "File size",
    type: "Detected type",
    ext: "Suggested extension",
    basis: "Detection method",
    signature: "File content signature",
    text: "Text content estimate (first 64 KB at most)",
    unknown: "Unknown file type",
    empty: "Empty file; type cannot be determined",
    unknownHint:
      "The file may be damaged or use an unsupported format. Its extension is not used to guess the type.",
    match: "The current extension matches the detected type.",
    mismatch:
      "The current extension does not match. See the suggested extension.",
    missing: "This file has no extension. See the suggested extension.",
    uncertain:
      "Text can belong to several formats; the current extension cannot be verified.",
    error: "Could not identify the file. Please select it again.",
    timeout: "Detection timed out. The file may be too complex or damaged.",
    single: "Please select one file at a time.",
  },
} as const;

export function FileTypeWorkbench({ locale }: { readonly locale: SiteLocale }) {
  const t = copy[locale];
  const input = useRef<HTMLInputElement>(null);
  const job = useRef<{
    worker: Worker;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Detection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function stop() {
    if (job.current) {
      job.current.worker.terminate();
      clearTimeout(job.current.timer);
      job.current = null;
    }
  }
  useEffect(() => () => stop(), []);

  function select(files: FileList | null) {
    if (!files?.length) return;
    stop();
    setResult(null);
    setError("");
    setBusy(false);
    setFile(null);
    if (files.length !== 1) {
      setError(t.single);
      return;
    }
    const selected = files[0]!;
    setFile(selected);
    setBusy(true);
    try {
      const worker = new Worker(new URL("./detect.worker.ts", import.meta.url));
      const timer = setTimeout(() => {
        stop();
        setBusy(false);
        setError(t.timeout);
      }, 15_000);
      job.current = { worker, timer };
      worker.onmessage = (
        event: MessageEvent<{ result?: Detection; error?: boolean }>,
      ) => {
        if (job.current?.worker !== worker) return;
        stop();
        setBusy(false);
        if (event.data.result) setResult(event.data.result);
        else setError(t.error);
      };
      worker.onerror = () => {
        if (job.current?.worker !== worker) return;
        stop();
        setBusy(false);
        setError(t.error);
      };
      worker.postMessage(selected);
    } catch {
      stop();
      setBusy(false);
      setError(t.error);
    }
  }

  const status =
    file && result ? extensionStatus(file.name, result) : "unknown";
  return (
    <section className="file-type-workbench" aria-label={t.type}>
      <div
        className="file-type-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          select(event.dataTransfer.files);
        }}
      >
        <FileSearch aria-hidden="true" size={32} />
        <h2>{t.drop}</h2>
        <p>{t.privacy}</p>
        <button
          type="button"
          className="tool-button tool-primary"
          onClick={() => input.current?.click()}
        >
          <Upload aria-hidden="true" size={18} />
          {t.choose}
        </button>
        <input
          ref={input}
          id="file-type-input"
          type="file"
          aria-label={t.choose}
          hidden
          onChange={(event) => {
            select(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <p className="matrix-hint">{t.hint}</p>
      <div className="tool-toolbar">
        <p role="status" className="tool-status">
          {busy
            ? t.busy
            : result
              ? result.ext
                ? `${t.type}: ${result.ext.toUpperCase()}`
                : t[result.kind === "empty" ? "empty" : "unknown"]
              : ""}
        </p>
        <button
          type="button"
          className="tool-button"
          disabled={!file && !error}
          onClick={() => {
            stop();
            setFile(null);
            setResult(null);
            setError("");
            setBusy(false);
            if (input.current) input.current.value = "";
          }}
        >
          {t.clear}
        </button>
      </div>
      {file && (
        <dl className="file-type-result">
          <div>
            <dt>{t.name}</dt>
            <dd>{file.name}</dd>
          </div>
          <div>
            <dt>{t.size}</dt>
            <dd>{file.size.toLocaleString(locale)} bytes</dd>
          </div>
          {result?.ext && (
            <>
              <div>
                <dt>{t.type}</dt>
                <dd>{result.ext.toUpperCase()}</dd>
              </div>
              <div>
                <dt>MIME</dt>
                <dd>{result.mime}</dd>
              </div>
              <div>
                <dt>{t.ext}</dt>
                <dd>.{result.ext}</dd>
              </div>
              <div>
                <dt>{t.basis}</dt>
                <dd>{result.kind === "signature" ? t.signature : t.text}</dd>
              </div>
            </>
          )}
        </dl>
      )}
      {result?.kind === "unknown" && (
        <p className="tool-error">{t.unknownHint}</p>
      )}
      {status !== "unknown" && (
        <p className={status === "mismatch" ? "tool-error" : "matrix-hint"}>
          {t[status]}
        </p>
      )}
      {error && (
        <p className="tool-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
