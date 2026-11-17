export interface RegexInput {
  pattern: string;
  flags: string;
  text: string;
}

export type RegexResult = "matched" | "unmatched" | "invalid" | "failed";

self.onmessage = ({ data }: MessageEvent<RegexInput>) => {
  let result: RegexResult;
  try {
    const expression = new RegExp(data.pattern, data.flags);
    result = expression.test(data.text) ? "matched" : "unmatched";
  } catch (error) {
    result = error instanceof SyntaxError ? "invalid" : "failed";
  }
  self.postMessage(result);
};
