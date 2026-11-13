import { describe, expect, it } from "vitest";

import {
  Base64Error,
  decodeBase64,
  encodeBase64,
} from "@/features/tools/base64/codec";

describe("Base64 text conversion", () => {
  it.each([
    ["", ""],
    ["f", "Zg=="],
    ["fo", "Zm8="],
    ["foo", "Zm9v"],
    ["你好", "5L2g5aW9"],
    ["👋", "8J+Riw=="],
  ])("converts the known vector %j", (text, encoded) => {
    expect(encodeBase64(text)).toBe(encoded);
    expect(decodeBase64(encoded)).toBe(text);
  });

  it("preserves line breaks, nulls, BOMs, and large Unicode input", () => {
    const text = "\uFEFF你好 👋\r\n\0".repeat(20000);
    expect(encodeBase64(text)).toBe(
      Buffer.from(text, "utf8").toString("base64"),
    );
    expect(decodeBase64(encodeBase64(text))).toBe(text);
  });

  it("accepts line-wrapped Base64 and omitted padding", () => {
    expect(decodeBase64(" Z m\n8=\r\n")).toBe("fo");
    expect(decodeBase64("Zg")).toBe("f");
    expect(decodeBase64("Zm8")).toBe("fo");
  });

  it.each(["a", "===", "a===", "Zg=", "Zm=8", "你好", "@@@", "8J-Riw=="])(
    "rejects invalid syntax %j",
    (value) => {
      expect(() => decodeBase64(value)).toThrow(
        new Base64Error("invalid-base64"),
      );
    },
  );

  it.each(["/w==", "wK8=", "7aCA"])("rejects non-UTF-8 bytes %j", (value) => {
    expect(() => decodeBase64(value)).toThrow(new Base64Error("invalid-utf8"));
  });
});
