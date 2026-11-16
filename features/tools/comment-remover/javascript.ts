import { tokenizer } from "acorn";

/** Tokenizing distinguishes comments from regex literals and template text. */
export function removeJavaScriptComments(source: string): string {
  const result: string[] = [];
  let cursor = 0;
  const tokens = tokenizer(source, {
    ecmaVersion: "latest",
    sourceType: "module",
    allowHashBang: true,
    onComment(block, _text, start, end) {
      result.push(source.slice(cursor, start));
      result.push(
        (block ? " " : "") +
          source.slice(start, end).replace(/[^\r\n\u2028\u2029]/g, ""),
      );
      cursor = end;
    },
  });
  while (tokens.getToken().type.label !== "eof") {
    /* Scan all tokens. */
  }
  result.push(source.slice(cursor));
  return result.join("");
}
