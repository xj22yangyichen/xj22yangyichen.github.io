"use client";

import { useState } from "react";
import type { SiteLocale } from "@/lib/site-config";
import { matrixTools, type MatrixOperation } from "../registry";
import {
  calculateMatrix,
  MatrixError,
  type MatrixErrorCode,
} from "./calculate";

import { solveLinearSystem, formatLinearSolution } from "./solve";

const errors: Record<SiteLocale, Record<MatrixErrorCode, string>> = {
  "zh-CN": {
    empty: "请输入矩阵。",
    number: "请输入有效的实数，数字之间用空格或逗号分隔，不要留空元素或空行。",
    ragged: "矩阵每一行的数字个数必须相同。",
    size: "每个矩阵最多支持 50 行、50 列。",
    square: "此运算要求方阵：行数与列数必须相同。",
    dimensions: "矩阵 A 的列数必须等于矩阵 B 的行数。",
    singular: "矩阵不可逆，请输入非奇异方阵。",
    numeric: "计算超出数值范围或无法得到可靠结果，请调整矩阵数值后重试。",
  },
  en: {
    empty: "Enter a matrix.",
    number:
      "Enter finite real numbers separated by spaces or commas, without empty entries or rows.",
    ragged: "Every row must contain the same number of values.",
    size: "Each matrix supports up to 50 rows and 50 columns.",
    square:
      "This operation requires a square matrix with equal row and column counts.",
    dimensions:
      "The number of columns in A must equal the number of rows in B.",
    singular: "This matrix is singular and has no inverse.",
    numeric:
      "The calculation exceeded the numeric range or could not produce a reliable result. Adjust the values and try again.",
  },
};

export function MatrixWorkbench({
  locale,
  operation,
}: {
  readonly locale: SiteLocale;
  readonly operation: MatrixOperation;
}) {
  const en = locale === "en";
  const multiply = operation === "multiply";
  const solve = operation === "solve";
  const twoInputs = multiply || solve;
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [output, setOutput] = useState("");
  const [decimalPlaces, setDecimalPlaces] = useState(4);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  function reset() {
    setOutput("");
    setError("");
    setStatus("");
  }
  function calculate(places = decimalPlaces) {
    reset();
    try {
      setOutput(
        solve
          ? formatLinearSolution(solveLinearSystem(a, b), en, places)
          : calculateMatrix(operation, a, b, places),
      );
      setStatus(en ? "Calculation complete." : "计算完成。");
    } catch (cause) {
      setError(
        solve && cause instanceof MatrixError && cause.code === "dimensions"
          ? en
            ? "b must have one column and the same number of rows as A."
            : "常数列 b 必须只有一列，且行数与系数矩阵 A 相同。"
          : errors[locale][
              cause instanceof MatrixError ? cause.code : "numeric"
            ],
      );
    }
  }
  return (
    <section aria-label={matrixTools[operation].title[locale]}>
      <p id="matrix-hint" className="matrix-hint">
        {solve
          ? en
            ? "Separate rows with line breaks and coefficients with spaces or commas. Enter the coefficients in A and constants in b (one per row), in variable order x1, x2, … . Example: x1 + x2 = 3; 2x1 − x2 = 0. Supports up to 50 equations and 50 unknowns. Rank uses a relative tolerance of 1e-12; near-dependent systems may lose accuracy. Values are rounded to the selected decimal places."
            : "每个方程占一行，系数用空格或逗号分隔。按 x1、x2、… 的顺序在 A 中输入系数，在 b 中每行输入一个常数。例如：x1 + x2 = 3；2x1 − x2 = 0。最多支持 50 个方程、50 个未知数。秩判定使用 1e-12 相对容差，接近线性相关的方程组可能存在精度误差；结果按所选小数位数四舍五入。"
          : en
            ? "Separate rows with line breaks and numbers with spaces or commas. Real numbers only; up to 50 × 50. Results are rounded to the selected decimal places, with trailing zeros omitted. Ill-conditioned matrices may lose accuracy."
            : "每行用换行分隔，数字之间用空格或逗号分隔。支持实数，最大 50 × 50；结果按所选小数位数四舍五入，省略末尾的零。病态矩阵可能存在精度误差。"}
      </p>
      <div className="tool-toolbar">
        <div className="matrix-precision">
          <label htmlFor="matrix-decimal-places">
            {en ? "Decimal places" : "小数位数"}
          </label>
          <select
            id="matrix-decimal-places"
            value={decimalPlaces}
            onChange={(event) => {
              const places = Number(event.target.value);
              setDecimalPlaces(places);
              if (output) calculate(places);
            }}
          >
            {Array.from({ length: 11 }, (_, places) => (
              <option key={places} value={places}>
                {places}
              </option>
            ))}
          </select>
        </div>
        <div className="tool-secondary-actions">
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              setA(
                solve
                  ? "1 1\n2 -1"
                  : operation === "eigenvalues"
                    ? "0 -1\n1 0"
                    : "1 2\n3 4",
              );
              setB(solve ? "3\n0" : multiply ? "5 6\n7 8" : "");
              reset();
            }}
          >
            {en ? "Try an example" : "试用示例"}
          </button>
          <button
            type="button"
            className="tool-button"
            disabled={!a && !b && !output}
            onClick={() => {
              setA("");
              setB("");
              reset();
            }}
          >
            {en ? "Clear" : "清空"}
          </button>
        </div>
      </div>
      <div className="tool-editors">
        {(twoInputs ? ["a", "b"] : ["a"]).map((name) => (
          <div className="tool-editor" key={name}>
            <div className="tool-editor-heading">
              <label htmlFor={`matrix-${name}`}>
                {solve
                  ? name === "a"
                    ? en
                      ? "Coefficient matrix A"
                      : "系数矩阵 A"
                    : en
                      ? "Constants b"
                      : "常数列 b"
                  : `${en ? "Matrix" : "矩阵"} ${name.toUpperCase()}`}
              </label>
            </div>
            <textarea
              id={`matrix-${name}`}
              value={name === "a" ? a : b}
              onChange={(event) => {
                (name === "a" ? setA : setB)(event.target.value);
                reset();
              }}
              placeholder={
                solve ? (name === "a" ? "1 1\n2 -1" : "3\n0") : "1 2\n3 4"
              }
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-invalid={Boolean(error)}
              aria-describedby={`matrix-hint${error ? " matrix-error" : ""}`}
            />
          </div>
        ))}
        <div
          className={`tool-editor tool-output${twoInputs ? " matrix-product" : ""}`}
        >
          <div className="tool-editor-heading">
            <label htmlFor="matrix-output">
              {en ? "Result" : "结果"}
              <span>
                {solve
                  ? "Ax = b"
                  : multiply
                    ? "A × B"
                    : operation === "inverse"
                      ? "A⁻¹"
                      : "λ"}
              </span>
            </label>
            <button
              type="button"
              className="tool-button"
              disabled={!output}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output);
                  setStatus(en ? "Copied" : "已复制");
                } catch {
                  setStatus(
                    en
                      ? "Could not copy. Select the result and copy it manually."
                      : "复制失败，请选中结果后手动复制。",
                  );
                }
              }}
            >
              {en ? "Copy result" : "复制结果"}
            </button>
          </div>
          <textarea
            id="matrix-output"
            value={output}
            readOnly
            spellCheck={false}
            placeholder={
              en ? "Your result will appear here" : "计算结果将显示在这里"
            }
          />
        </div>
      </div>
      <div className="tool-convert-row">
        <button
          type="button"
          className="tool-button tool-primary"
          disabled={!a.trim() || (twoInputs && !b.trim())}
          onClick={() => calculate()}
        >
          {en ? "Calculate" : "计算"}
        </button>
        <p className="tool-status" role="status">
          {status}
        </p>
      </div>
      {error ? (
        <p id="matrix-error" className="tool-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
