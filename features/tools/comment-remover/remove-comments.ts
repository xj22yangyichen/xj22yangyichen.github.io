export type CodeLanguage = "cpp" | "rust" | "python" | "go";

/** Scan literals before comments; replacing block comments with whitespace keeps tokens apart. */
export function removeComments(source: string, language: CodeLanguage): string {
  const removals: { start: number; end: number; block: boolean }[] = [];
  const length = source.length;

  function lineComment(start: number): number {
    let end = start;
    while (end < length && source[end] !== "\n" && source[end] !== "\r") {
      if (language === "cpp" && source[end] === "\\") {
        if (source[end + 1] === "\n") {
          end += 2;
          continue;
        }
        if (source.slice(end + 1, end + 3) === "\r\n") {
          end += 3;
          continue;
        }
      }
      end++;
    }
    removals.push({ start, end, block: false });
    return end;
  }

  function quoted(start: number, delimiter: string, formatted = false): number {
    let i = start + delimiter.length;
    while (i < length) {
      if (source.startsWith(delimiter, i)) return i + delimiter.length;
      if (source[i] === "\\") {
        // Backslashes do not escape replacement-field braces in Python f-strings.
        i +=
          formatted && (source[i + 1] === "{" || source[i + 1] === "}") ? 1 : 2;
        continue;
      }
      if (formatted && source[i] === "{") {
        if (source[i + 1] === "{") i += 2;
        else i = expression(i + 1);
        continue;
      }
      i++;
    }
    return length;
  }

  function pythonString(i: number): number {
    const quote = source[i]!;
    const delimiter = source.startsWith(quote.repeat(3), i)
      ? quote.repeat(3)
      : quote;
    let prefixStart = i;
    while (prefixStart > 0 && /[a-zA-Z]/.test(source[prefixStart - 1]!))
      prefixStart--;
    const prefix = source.slice(prefixStart, i).toLowerCase();
    return quoted(i, delimiter, /^(?:f|fr|rf|t|tr|rt)$/.test(prefix));
  }

  // Replacement fields may contain quoted strings and, in modern Python, comments.
  function expression(start: number): number {
    let i = start;
    let depth = 0;
    while (i < length) {
      const c = source[i];
      if (c === '"' || c === "'") {
        i = pythonString(i);
        continue;
      }
      if (c === "#") {
        i = lineComment(i);
        continue;
      }
      if (c === "}" && depth === 0) return i + 1;
      if (c === ":" && depth === 0) {
        i++;
        while (i < length && source[i] !== "}") {
          i = source[i] === "{" ? expression(i + 1) : i + 1;
        }
        return Math.min(i + 1, length);
      }
      if (c === "(" || c === "[" || c === "{") depth++;
      if (c === ")" || c === "]" || c === "}") depth--;
      i++;
    }
    return length;
  }

  let i = 0;
  while (i < length) {
    const c = source[i];
    if (language === "python") {
      if (c === '"' || c === "'") {
        i = pythonString(i);
        continue;
      }
      if (c === "#") {
        i = lineComment(i);
        continue;
      }
    } else {
      if (
        language === "cpp" &&
        /[0-9]/.test(c!) &&
        (i === 0 || !/[\w]/.test(source[i - 1]!))
      ) {
        i += /^[0-9][\w.']*/.exec(source.slice(i))![0].length;
        continue;
      }
      if (language === "cpp" && c === "R" && source[i + 1] === '"') {
        const raw = /^R"([^\s()\\]{0,16})\(/.exec(source.slice(i, i + 20));
        if (raw) {
          const close = `)${raw[1]}"`;
          const end = source.indexOf(close, i + raw[0].length);
          i = end < 0 ? length : end + close.length;
          continue;
        }
      }
      if (language === "rust" && c === "r") {
        let end = i + 1;
        while (source[end] === "#") end++;
        if (source[end] === '"') {
          const close = '"' + "#".repeat(end - i - 1);
          const closing = source.indexOf(close, end + 1);
          i = closing < 0 ? length : closing + close.length;
          continue;
        }
      }
      if (language === "go" && c === "`") {
        const end = source.indexOf("`", i + 1);
        i = end < 0 ? length : end + 1;
        continue;
      }
      if (c === '"' || c === "'") {
        // Rust lifetimes and labels are not character literals.
        if (
          language === "rust" &&
          c === "'" &&
          !/^'(?:[^'\\\r\n]|\\(?:[nrt0\\'"]|x[0-9a-fA-F]{2}|u\{[0-9a-fA-F_]+\}))'/u.test(
            source.slice(i, i + 20),
          )
        ) {
          i++;
          continue;
        }
        i = quoted(i, c);
        continue;
      }
      if (source.startsWith("//", i)) {
        i = lineComment(i);
        continue;
      }
      if (source.startsWith("/*", i)) {
        const start = i;
        let depth = 1;
        i += 2;
        while (i < length && depth > 0) {
          if (language === "rust" && source.startsWith("/*", i)) {
            depth++;
            i += 2;
          } else if (source.startsWith("*/", i)) {
            depth--;
            i += 2;
          } else i++;
        }
        removals.push({ start, end: i, block: true });
        continue;
      }
    }
    i++;
  }
  let cursor = 0;
  const result: string[] = [];
  for (const { start, end, block } of removals) {
    result.push(source.slice(cursor, start));
    const newlines = source.slice(start, end).replace(/[^\r\n]/g, "");
    result.push(block ? " " + newlines : newlines);
    cursor = end;
  }
  result.push(source.slice(cursor));
  return result.join("");
}
