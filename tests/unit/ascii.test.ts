import { describe, expect, it } from "vitest";

import {
  AsciiError,
  decodeAscii,
  encodeAscii,
} from "@/features/tools/ascii/codec";

describe("ASCII text conversion", () => {
  it.each([
    ["", ""],
    ["Hello!", "72 101 108 108 111 33"],
    ["A B", "65 32 66"],
    ["\0\t\n\r\x7f", "0 9 10 13 127"],
  ])("converts the known vector %j", (text, codes) => {
    expect(encodeAscii(text)).toBe(codes);
    expect(decodeAscii(codes)).toBe(text);
  });

  it("round-trips every ASCII character and long input", () => {
    const text = Array.from({ length: 128 }, (_, code) =>
      String.fromCharCode(code),
    )
      .join("")
      .repeat(1000);
    expect(decodeAscii(encodeAscii(text))).toBe(text);
  });

  it("accepts whitespace, commas and leading zeros", () => {
    expect(decodeAscii(" 065, 66\n67\t68  ")).toBe("ABCD");
    expect(decodeAscii(" \n\t")).toBe("");
  });

  it.each(["中文", "é", "👋", "\x80", "\uD800"])(
    "rejects non-ASCII text %j",
    (text) => {
      expect(() => encodeAscii(text)).toThrow(new AsciiError("non-ascii"));
    },
  );

  it.each([
    "128",
    "-1",
    "65.5",
    "6e1",
    "0x41",
    "65a",
    "65,,66",
    "65,",
    ",65",
    "99999999999999999999999",
  ])("rejects invalid codes %j", (text) => {
    expect(() => decodeAscii(text)).toThrow(new AsciiError("invalid-code"));
  });
});
