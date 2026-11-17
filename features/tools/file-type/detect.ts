import { fileTypeFromBlob } from "file-type";

export interface Detection {
  kind: "signature" | "text" | "unknown" | "empty";
  ext?: string;
  mime?: string;
}

// Only content is inspected: neither the filename nor the browser's MIME hint.
export async function detectFile(file: Blob): Promise<Detection> {
  if (!file.size) return { kind: "empty" };
  try {
    const result = await fileTypeFromBlob(file, {
      maxBufferSize: 8 * 1024 * 1024,
    });
    if (result) return { kind: "signature", ...result };
  } catch {
    // Truncated or malformed binary files must not become confident guesses.
    return { kind: "unknown" };
  }
  const limit = 64 * 1024;
  const bytes = new Uint8Array(await file.slice(0, limit).arrayBuffer());
  const encoding =
    bytes[0] === 0xff && bytes[1] === 0xfe
      ? "utf-16le"
      : bytes[0] === 0xfe && bytes[1] === 0xff
        ? "utf-16be"
        : "utf-8";
  let text: string;
  try {
    text = new TextDecoder(encoding, { fatal: true }).decode(bytes, {
      stream: file.size > limit,
    });
  } catch {
    return { kind: "unknown" };
  }
  if (/[\u0000-\u0008\u000b\u000e-\u001f\u007f]/u.test(text))
    return { kind: "unknown" };
  if (file.size <= limit) {
    try {
      JSON.parse(text);
      return { kind: "text", ext: "json", mime: "application/json" };
    } catch {
      /* Other text formats are intentionally left as plain text. */
    }
  }
  return { kind: "text", ext: "txt", mime: "text/plain" };
}

export function extensionStatus(name: string, result: Detection) {
  if (!result.ext) return "unknown";
  const extension = /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase();
  if (!extension || name === `.${extension}`) return "missing";
  const aliases: Record<string, string[]> = {
    jpg: ["jpeg", "jpe"],
    tif: ["tiff"],
    gz: ["gzip"],
    mid: ["midi"],
    html: ["htm"],
    aif: ["aiff"],
    mov: ["qt"],
  };
  if (extension === result.ext || aliases[result.ext]?.includes(extension))
    return "match";
  return result.kind === "text" ? "uncertain" : "mismatch";
}
