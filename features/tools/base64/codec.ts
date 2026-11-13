export class Base64Error extends Error {
  constructor(readonly code: "invalid-base64" | "invalid-utf8") {
    super(code);
    this.name = "Base64Error";
  }
}

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const chunks: string[] = [];
  // Keep each spread below the argument limit, including for long input.
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 8192)));
  }
  return btoa(chunks.join(""));
}

export function decodeBase64(text: string): string {
  const normalized = text.replace(/[\t\n\f\r ]/gu, "");
  if (
    !/^[A-Za-z0-9+/]*={0,2}$/u.test(normalized) ||
    normalized.length % 4 === 1 ||
    (normalized.includes("=") && normalized.length % 4 !== 0)
  ) {
    throw new Base64Error("invalid-base64");
  }

  let binary: string;
  try {
    binary = atob(normalized);
  } catch {
    throw new Base64Error("invalid-base64");
  }
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      Uint8Array.from(binary, (character) => character.charCodeAt(0)),
    );
  } catch {
    throw new Base64Error("invalid-utf8");
  }
}
