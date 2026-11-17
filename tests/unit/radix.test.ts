import { describe, expect, it } from "vitest";
import { convertRadix } from "@/features/tools/radix/convert";

describe("number base conversion", () => {
  it.each([
    ["255", 10, 16, "FF"],
    ["ff.8", 16, 10, "255.5"],
    ["-101.01", 2, 10, "-5.25"],
    ["+000", 10, 2, "0"],
    ["-0.0", 10, 16, "0"],
    [".5", 10, 2, "0.1"],
    [" Z ", 36, 10, "35"],
    ["9007199254740993", 10, 16, "20000000000001"],
    ["777", 8, 2, "111111111"],
  ])("converts %s from %i to %i exactly", (input, from, to, value) => {
    expect(convertRadix(input, from, to)).toEqual({ value, truncated: false });
  });
  it("marks recurring and very small fractions as truncated", () => {
    expect(convertRadix("0.1", 10, 2)).toEqual({
      value: "0.00011001100110011001100110011001",
      truncated: true,
    });
    expect(convertRadix("0." + "0".repeat(40) + "1", 10, 10).truncated).toBe(
      true,
    );
  });
  it("round trips large signed integers in every base", () => {
    const value = "-1234567890123456789012345678901234567890";
    for (let base = 2; base <= 36; base++) {
      expect(
        convertRadix(convertRadix(value, 10, base).value, base, 10).value,
      ).toBe(value);
    }
    expect(convertRadix("1".repeat(4096), 2, 16).value).toBe("F".repeat(1024));
  });
  it.each([
    "",
    " ",
    "2",
    "102",
    "1.2",
    "0b10",
    "--1",
    "1 0",
    "1e3",
    ".",
    "1..0",
    "１２",
  ])("rejects invalid binary %j", (input) => {
    expect(() => convertRadix(input, 2, 10)).toThrow("input");
  });
  it("validates bases and limits input size", () => {
    for (const base of [1, 37, 2.5, NaN]) {
      expect(() => convertRadix("1", base, 10)).toThrow("base");
      expect(() => convertRadix("1", 10, base)).toThrow("base");
    }
    expect(() => convertRadix("1".repeat(4097), 2, 10)).toThrow("length");
  });
});
