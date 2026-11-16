import {
  EigenvalueDecomposition,
  inverse,
  LuDecomposition,
  Matrix,
} from "ml-matrix";

import type { MatrixOperation } from "../registry";

export type MatrixErrorCode =
  | "empty"
  | "number"
  | "ragged"
  | "size"
  | "square"
  | "dimensions"
  | "singular"
  | "numeric";

export class MatrixError extends Error {
  constructor(public readonly code: MatrixErrorCode) {
    super(code);
  }
}

export const MAX_MATRIX_SIZE = 50;

export function parseMatrix(input: string): number[][] {
  if (!input.trim()) throw new MatrixError("empty");
  const lines = input.trim().split(/\r\n|\n|\r/);
  if (lines.length > MAX_MATRIX_SIZE) throw new MatrixError("size");
  const rows = lines.map((line) => {
    // Split comma groups first so missing entries (1,,2) are never silently removed.
    const tokens = line
      .trim()
      .split(/[,，]/)
      .flatMap((group) => group.trim().split(/\s+/));
    if (tokens.length > MAX_MATRIX_SIZE) throw new MatrixError("size");
    return tokens.map((token) => {
      if (
        !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(token) ||
        !Number.isFinite(Number(token))
      ) {
        throw new MatrixError("number");
      }
      return Number(token);
    });
  });
  if (rows.some((row) => row.length !== rows[0]!.length))
    throw new MatrixError("ragged");
  return rows;
}

export function formatNumber(value: number, decimalPlaces = 4): string {
  if (!Number.isFinite(value)) throw new MatrixError("numeric");
  const formatted = value.toLocaleString("en-US", {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  });
  return formatted === "-0" ? "0" : formatted;
}

function formatMatrix(matrix: Matrix, decimalPlaces: number): string {
  return matrix
    .to2DArray()
    .map((row) =>
      row.map((value) => formatNumber(value, decimalPlaces)).join(" "),
    )
    .join("\n");
}

export function calculateMatrix(
  operation: Exclude<MatrixOperation, "solve">,
  inputA: string,
  inputB = "",
  decimalPlaces = 4,
): string {
  const a = new Matrix(parseMatrix(inputA));
  if (operation === "multiply") {
    const b = new Matrix(parseMatrix(inputB));
    if (a.columns !== b.rows) throw new MatrixError("dimensions");
    return formatMatrix(a.mmul(b), decimalPlaces);
  }
  if (!a.isSquare()) throw new MatrixError("square");
  // Scaling protects the decomposition from overflow for very large finite inputs.
  const scale = Math.max(...a.to1DArray().map(Math.abs));
  const normalized = scale ? a.clone().div(scale) : a.clone();
  if (operation === "inverse") {
    if (new LuDecomposition(normalized).isSingular())
      throw new MatrixError("singular");
    return formatMatrix(inverse(normalized).div(scale), decimalPlaces);
  }
  const decomposition = new EigenvalueDecomposition(normalized);
  return decomposition.realEigenvalues
    .map((real, index) => {
      const imaginary = decomposition.imaginaryEigenvalues[index]! * scale;
      const value = formatNumber(real * scale, decimalPlaces);
      const imaginaryValue = formatNumber(Math.abs(imaginary), decimalPlaces);
      return imaginaryValue === "0"
        ? value
        : `${value} ${imaginary < 0 ? "-" : "+"} ${imaginaryValue}i`;
    })
    .join("\n");
}
