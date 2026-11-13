export class AsciiError extends Error {
  constructor(readonly code: "non-ascii" | "invalid-code") {
    super(code);
    this.name = "AsciiError";
  }
}

export function encodeAscii(text: string): string {
  return Array.from(text, (character) => {
    const code = character.charCodeAt(0);
    if (code > 127) {
      throw new AsciiError("non-ascii");
    }
    return String(code);
  }).join(" ");
}

export function decodeAscii(text: string): string {
  if (!text.trim()) return "";
  // Accept spaces, line breaks or commas between complete decimal integers.
  if (!/^\s*\d+(?:(?:\s*,\s*|\s+)\d+)*\s*$/u.test(text)) {
    throw new AsciiError("invalid-code");
  }
  return text
    .trim()
    .split(/[\s,]+/u)
    .map((token) => {
      const code = Number(token);
      if (!Number.isInteger(code) || code < 0 || code > 127) {
        throw new AsciiError("invalid-code");
      }
      return String.fromCharCode(code);
    })
    .join("");
}
