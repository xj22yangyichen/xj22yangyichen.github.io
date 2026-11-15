import { describe, expect, it } from "vitest";
import {
  calculateMatrix,
  formatNumber,
  MatrixError,
  parseMatrix,
} from "@/features/tools/matrix/calculate";

describe("matrix tools", () => {
  it("parses spaces, commas, CRLF, signs and scientific notation", () => {
    expect(parseMatrix(" 1, -2  3e-2\r\n.5，+6,7 \n")).toEqual([
      [1, -2, 0.03],
      [0.5, 6, 7],
    ]);
  });
  it.each([
    "",
    "1,,2",
    "1,",
    ",1",
    "NaN",
    "Infinity",
    "0x10",
    "1e400",
    "1 x",
    "1\n\n2",
    "1 2\n3",
  ])("rejects malformed input %j", (input) => {
    expect(() => parseMatrix(input)).toThrow(MatrixError);
  });
  it("bounds matrix size", () => {
    expect(() => parseMatrix(Array(51).fill("1").join(" "))).toThrow(
      new MatrixError("size"),
    );
    expect(() => parseMatrix(Array(51).fill("1").join("\n"))).toThrow(
      new MatrixError("size"),
    );
  });
  it("multiplies rectangular matrices in A × B order", () => {
    expect(
      calculateMatrix("multiply", "1 2 3\n4 5 6", "7 8\n9 10\n11 12"),
    ).toBe("58 64\n139 154");
    expect(() => calculateMatrix("multiply", "1 2", "3 4")).toThrow(
      new MatrixError("dimensions"),
    );
  });
  it("inverts with row pivoting and rounds small values at the selected precision", () => {
    expect(calculateMatrix("inverse", "0 2\n1 0")).toBe("0 1\n0.5 0");
    expect(calculateMatrix("inverse", "1e20")).toBe("0");
    expect(calculateMatrix("inverse", "1e10", "", 10)).toBe("0.0000000001");
    const a = "4 7 2\n3 6 1\n2 5 3";
    const product = parseMatrix(
      calculateMatrix("multiply", a, calculateMatrix("inverse", a, "", 10), 10),
    );
    product.forEach((row, i) =>
      row.forEach((value, j) => expect(value).toBeCloseTo(i === j ? 1 : 0, 9)),
    );
  });
  it.each(["1 2\n2 4", "0 0\n0 0"])("rejects singular matrices %j", (input) => {
    expect(() => calculateMatrix("inverse", input)).toThrow(
      new MatrixError("singular"),
    );
  });
  it.each(["inverse", "eigenvalues"] as const)(
    "requires a square matrix for %s",
    (operation) => {
      expect(() => calculateMatrix(operation, "1 2")).toThrow(
        new MatrixError("square"),
      );
    },
  );
  it("computes symmetric, triangular, repeated and scalar eigenvalues", () => {
    expect(
      calculateMatrix("eigenvalues", "2 1\n1 2").split("\n").sort(),
    ).toEqual(["1", "3"]);
    expect(
      calculateMatrix("eigenvalues", "1 2 3\n0 4 5\n0 0 6").split("\n").sort(),
    ).toEqual(["1", "4", "6"]);
    expect(calculateMatrix("eigenvalues", "2 1\n0 2")).toBe("2\n2");
    expect(calculateMatrix("eigenvalues", "-7")).toBe("-7");
    expect(calculateMatrix("eigenvalues", "0 0\n0 0")).toBe("0\n0");
  });
  it("computes complex eigenvalues", () => {
    expect(
      calculateMatrix("eigenvalues", "0 -1\n1 0").split("\n").sort(),
    ).toEqual(["0 + 1i", "0 - 1i"]);
    expect(
      calculateMatrix("eigenvalues", "0 -1 0\n1 0 0\n0 0 2").split("\n").sort(),
    ).toEqual(["0 + 1i", "0 - 1i", "2"]);
  });
  it("reports numeric overflow", () => {
    expect(() => calculateMatrix("multiply", "1e308", "2")).toThrow(
      new MatrixError("numeric"),
    );
  });
  it.each([
    [1.234567, 4, "1.2346"],
    [1.23, 4, "1.23"],
    [2, 4, "2"],
    [1.99999, 4, "2"],
    [-0.00001, 4, "0"],
    [1.5, 0, "2"],
    [-1.5, 0, "-2"],
    [1.005, 2, "1.01"],
    [0.12345678906, 10, "0.1234567891"],
    [1e-7, 10, "0.0000001"],
    [1e21, 4, "1000000000000000000000"],
  ])("formats %s to %s decimal places", (value, places, expected) => {
    expect(formatNumber(value, places)).toBe(expected);
  });
  it("applies precision to all operations and both complex components", () => {
    expect(calculateMatrix("multiply", "1.23456", "1")).toBe("1.2346");
    expect(calculateMatrix("inverse", "3", "", 2)).toBe("0.33");
    expect(
      calculateMatrix(
        "eigenvalues",
        "1.23456 -0.123456\n0.123456 1.23456",
        "",
        2,
      ),
    ).toBe("1.23 + 0.12i\n1.23 - 0.12i");
    expect(calculateMatrix("eigenvalues", "1 -0.00001\n0.00001 1")).toBe(
      "1\n1",
    );
  });
});
