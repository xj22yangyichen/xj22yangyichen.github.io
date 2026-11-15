import { describe, expect, it } from "vitest";
import {
  formatFactors,
  isPrime,
  MAX_INTEGER,
  parseInteger,
  primeFactors,
} from "@/features/tools/integer/calculate";

describe("exact integer tools", () => {
  it("parses without losing digits and includes the upper boundary", () => {
    expect(parseInteger(" 0009007199254740993 ")).toBe(
      BigInt("9007199254740993"),
    );
    expect(parseInteger("1152921504606846976")).toBe(MAX_INTEGER);
    expect(parseInteger("000")).toBe(BigInt(0));
  });
  it.each([
    "",
    " ",
    "-1",
    "+2",
    "1.5",
    "1e18",
    "2^60",
    "1,000",
    "12 34",
    "0xff",
    "１２",
  ])("rejects invalid input %s", (input) => {
    expect(() => parseInteger(input)).toThrow("invalid-integer");
  });
  it("rejects out of range values", () => {
    expect(() => parseInteger("1152921504606846977")).toThrow("out-of-range");
    expect(() => parseInteger("9".repeat(1000))).toThrow("out-of-range");
    expect(() => isPrime(MAX_INTEGER + BigInt(1))).toThrow();
    expect(() => primeFactors(BigInt(-2))).toThrow();
  });
  it.each([
    "2",
    "3",
    "37",
    "73",
    "193",
    "407521",
    "1000000007",
    "1152921504606846883",
  ])("recognizes prime %s", (n) => {
    expect(isPrime(BigInt(n))).toBe(true);
  });
  it.each([
    "0",
    "1",
    "4",
    "561",
    "3215031751",
    "341550071728321",
    "382512305654641305",
    "9007199254740993",
    "1152921504606846976",
  ])("rejects composite or non-prime %s", (n) => {
    expect(isPrime(BigInt(n))).toBe(false);
  });
  it("agrees with independent trial division for small numbers", () => {
    for (let n = 0; n <= 5000; n++) {
      let prime = n >= 2;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) prime = false;
      expect(isPrime(BigInt(n)), String(n)).toBe(prime);
    }
  });
  it.each([
    ["2", "2"],
    ["360", "2^3 × 3^2 × 5"],
    ["1152921504606846976", "2^60"],
    ["1000000016000000063", "1000000007 × 1000000009"],
    ["1000000014000000049", "1000000007^2"],
    ["1152921504606846883", "1152921504606846883"],
    ["9007199254740993", "3 × 107 × 28059810762433"],
  ])("factors %s exactly", (value, expected) => {
    const factors = primeFactors(BigInt(value));
    expect(formatFactors(factors)).toBe(expected);
    expect(factors.every(isPrime)).toBe(true);
    expect(factors.reduce((product, p) => product * p, BigInt(1))).toBe(
      BigInt(value),
    );
  });
  it("does not give a factorization for zero or one", () => {
    for (const n of [0, 1])
      expect(() => primeFactors(BigInt(n))).toThrow("no-factorization");
  });
});
