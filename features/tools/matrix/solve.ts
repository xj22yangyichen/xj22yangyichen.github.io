import { formatNumber, MatrixError, parseMatrix } from "./calculate";

export type LinearSolution =
  | { kind: "none" }
  | { kind: "unique" | "infinite"; particular: number[]; basis: number[][] };

// Row scaling and partial pivoting keep rank decisions independent of row units.
// Near-dependent rows are treated as dependent at this relative tolerance.
const tolerance = 1e-12;

export function solveLinearSystem(
  inputA: string,
  inputB: string,
): LinearSolution {
  const a = parseMatrix(inputA);
  const b = parseMatrix(inputB);
  if (b.length !== a.length || b.some((row) => row.length !== 1)) {
    throw new MatrixError("dimensions");
  }
  const n = a[0]!.length;
  const rows = a.map((row, i) => {
    const scale = Math.max(...row.map(Math.abs));
    if (!scale) return [...row, b[i]![0] === 0 ? 0 : 1];
    return [...row.map((value) => value / scale), b[i]![0]! / scale];
  });
  const bounds = rows.map((row) => Math.abs(row[n]!));
  const pivots: number[] = [];
  for (let col = 0; col < n && pivots.length < rows.length; col++) {
    const rank = pivots.length;
    let best = rank;
    for (let i = rank + 1; i < rows.length; i++) {
      if (Math.abs(rows[i]![col]!) > Math.abs(rows[best]![col]!)) best = i;
    }
    if (Math.abs(rows[best]![col]!) <= tolerance) continue;
    [rows[rank], rows[best]] = [rows[best]!, rows[rank]!];
    [bounds[rank], bounds[best]] = [bounds[best]!, bounds[rank]!];
    const pivot = rows[rank]![col]!;
    rows[rank] = rows[rank]!.map((value) => value / pivot);
    bounds[rank] = bounds[rank]! / Math.abs(pivot);
    for (let i = 0; i < rows.length; i++) {
      if (i === rank) continue;
      const factor = rows[i]![col]!;
      rows[i] = rows[i]!.map((value, j) => value - factor * rows[rank]![j]!);
      rows[i]![col] = 0;
      bounds[i] = bounds[i]! + Math.abs(factor) * bounds[rank]!;
    }
    pivots.push(col);
  }
  if (
    rows.some((row) => row.some((v) => !Number.isFinite(v))) ||
    bounds.some((v) => !Number.isFinite(v))
  ) {
    throw new MatrixError("numeric");
  }
  for (let i = pivots.length; i < rows.length; i++) {
    if (Math.abs(rows[i]![n]!) > tolerance * bounds[i]!)
      return { kind: "none" };
  }
  const particular = Array<number>(n).fill(0);
  pivots.forEach((col, i) => {
    particular[col] = rows[i]![n]!;
  });
  const basis: number[][] = [];
  for (let col = 0; col < n; col++) {
    if (pivots.includes(col)) continue;
    const vector = Array<number>(n).fill(0);
    vector[col] = 1;
    pivots.forEach((pivot, i) => {
      vector[pivot] = -rows[i]![col]!;
    });
    basis.push(vector);
  }
  return { kind: basis.length ? "infinite" : "unique", particular, basis };
}

export function formatLinearSolution(
  result: LinearSolution,
  en: boolean,
  places: number,
): string {
  if (result.kind === "none") return en ? "No solution." : "无解。";
  const vector = (values: number[]) =>
    `(${values.map((v) => formatNumber(v, places)).join(", ")})`;
  if (result.kind === "unique") {
    return [
      en ? "Unique solution" : "唯一解",
      ...result.particular.map(
        (v, i) => `x${i + 1} = ${formatNumber(v, places)}`,
      ),
    ].join("\n");
  }
  return [
    en ? "Infinitely many solutions" : "无穷多解",
    `x = ${vector(result.particular)}${result.basis.map((v, i) => ` + t${i + 1} · ${vector(v)}`).join("")}`,
    en
      ? "The parameters t1, t2, … are arbitrary real numbers; coordinates follow x1, x2, … ."
      : "参数 t1、t2、… 为任意实数；向量分量依次对应 x1、x2、…。",
  ].join("\n");
}
