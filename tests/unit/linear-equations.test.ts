import { describe, expect, it } from "vitest";
import {
  formatLinearSolution,
  solveLinearSystem,
} from "@/features/tools/matrix/solve";

describe("linear equation solver", () => {
  it("solves square, row-swapped and overdetermined systems", () => {
    expect(solveLinearSystem("1 1\n2 -1", "3\n0")).toEqual({
      kind: "unique",
      particular: [1, 2],
      basis: [],
    });
    expect(solveLinearSystem("0 1\n1 1", "2\n3")).toMatchObject({
      kind: "unique",
      particular: [1, 2],
    });
    expect(solveLinearSystem("1 1\n2 -1\n3 0", "3\n0\n3")).toMatchObject({
      kind: "unique",
      particular: [1, 2],
    });
  });
  it("detects inconsistent and zero-coefficient equations", () => {
    expect(solveLinearSystem("1 1\n2 2", "1\n3").kind).toBe("none");
    expect(solveLinearSystem("0 0", "1e-100").kind).toBe("none");
    expect(solveLinearSystem("0 0", "0")).toMatchObject({
      kind: "infinite",
      particular: [0, 0],
      basis: [
        [1, 0],
        [0, 1],
      ],
    });
  });
  it("returns a particular solution and null-space basis", () => {
    const result = solveLinearSystem("1 2 3\n2 4 6", "4\n8");
    expect(result).toEqual({
      kind: "infinite",
      particular: [4, 0, 0],
      basis: [
        [-2, 1, 0],
        [-3, 0, 1],
      ],
    });
    expect(formatLinearSolution(result, false, 4)).toContain(
      "x = (4, 0, 0) + t1 · (-2, 1, 0) + t2 · (-3, 0, 1)",
    );
  });
  it("handles row scaling and precision", () => {
    expect(
      solveLinearSystem("1e-100 1e-100\n2e100 -1e100", "3e-100\n0"),
    ).toMatchObject({ particular: [1, 2] });
    expect(formatLinearSolution(solveLinearSystem("3", "1"), true, 10)).toBe(
      "Unique solution\nx1 = 0.3333333333",
    );
  });
  it("rejects invalid shapes, numbers and numeric overflow", () => {
    for (const [a, b] of [
      ["", "1"],
      ["1 2\n3", "1\n2"],
      ["NaN", "1"],
      ["1", "1 2"],
      ["1\n2", "1"],
      ["1e-300", "1e300"],
    ]) {
      expect(() => solveLinearSystem(a!, b!)).toThrow();
    }
  });
});
