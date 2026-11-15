import type { IntegerOperation } from "../registry";
import {
  formatFactors,
  isPrime,
  parseInteger,
  primeFactors,
} from "./calculate";

export type IntegerResponse =
  { value: string; prime: boolean; factors?: string } | { error: string };

self.onmessage = (
  event: MessageEvent<{ input: string; operation: IntegerOperation }>,
) => {
  let response: IntegerResponse;
  try {
    const n = parseInteger(event.data.input);
    response =
      event.data.operation === "prime"
        ? { value: String(n), prime: isPrime(n) }
        : {
            value: String(n),
            prime: isPrime(n),
            factors: formatFactors(primeFactors(n)),
          };
  } catch (error) {
    response = { error: error instanceof Error ? error.message : "failed" };
  }
  self.postMessage(response);
};
