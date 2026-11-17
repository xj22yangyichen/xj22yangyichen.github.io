const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const MAX_INPUT_LENGTH = 4096;
export const FRACTION_DIGITS = 32;

export class RadixError extends Error {
  constructor(public readonly code: "base" | "input" | "length") {
    super(code);
  }
}

export function convertRadix(input: string, from: number, to: number) {
  if (
    ![from, to].every(
      (base) => Number.isInteger(base) && base >= 2 && base <= 36,
    )
  ) {
    throw new RadixError("base");
  }
  if (input.length > MAX_INPUT_LENGTH) throw new RadixError("length");
  const text = input.trim().toUpperCase();
  if (!/^[+-]?(?:[0-9A-Z]+(?:\.[0-9A-Z]*)?|\.[0-9A-Z]+)$/.test(text)) {
    throw new RadixError("input");
  }
  const negative = text.startsWith("-");
  const [whole, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  let numerator = BigInt(0);
  const sourceBase = BigInt(from);
  for (const char of whole + fraction) {
    const digit = digits.indexOf(char);
    if (digit >= from) throw new RadixError("input");
    numerator = numerator * sourceBase + BigInt(digit);
  }
  const denominator = sourceBase ** BigInt(fraction.length);
  let remainder = numerator % denominator;
  let result = (numerator / denominator).toString(to).toUpperCase();
  let fractional = "";
  for (let i = 0; remainder && i < FRACTION_DIGITS; i++) {
    remainder *= BigInt(to);
    fractional += digits[Number(remainder / denominator)];
    remainder %= denominator;
  }
  if (fractional) result += "." + fractional;
  if (negative && numerator !== BigInt(0)) result = "-" + result;
  return { value: result, truncated: remainder !== BigInt(0) };
}
