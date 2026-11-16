import { removeJavaScriptComments } from "./javascript";

export type CodeLanguage =
  "cpp" | "rust" | "python" | "go" | "java" | "javascript" | "php" | "custom";
export interface CommentRules {
  readonly line: string;
  readonly blockStart: string;
  readonly blockEnd: string;
}

export function validCommentRules(rules: CommentRules): boolean {
  return (
    Boolean(rules.line || rules.blockStart) &&
    Boolean(rules.blockStart) === Boolean(rules.blockEnd) &&
    !Object.values(rules).some((value) => /[\r\n]/.test(value))
  );
}

/** Scan literals before comments; replacing block comments with whitespace keeps tokens apart. */
export function removeComments(
  source: string,
  language: CodeLanguage,
  rules?: CommentRules,
): string {
  if (language === "javascript") return removeJavaScriptComments(source);
  if (language === "custom" && (!rules || !validCommentRules(rules)))
    throw new Error("Invalid comment rules");
  const line = language === "custom" ? rules!.line : "//";
  const blockStart = language === "custom" ? rules!.blockStart : "/*";
  const blockEnd = language === "custom" ? rules!.blockEnd : "*/";
  const removals: { start: number; end: number; block: boolean }[] = [];
  const length = source.length;

  function lineComment(start: number): number {
    let end = start;
    while (end < length && source[end] !== "\n" && source[end] !== "\r") {
      if (language === "php" && source.startsWith("?>", end)) break;
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
  const phpTagged = language === "php" && /<\?(?:php\b|=)/i.test(source);
  let inPhp = !phpTagged;
  while (i < length) {
    if (phpTagged && !inPhp) {
      const opening = /<\?(?:php\b|=)/gi;
      opening.lastIndex = i;
      const match = opening.exec(source);
      if (!match) break;
      i = opening.lastIndex;
      inPhp = true;
      continue;
    }
    if (phpTagged && source.startsWith("?>", i)) {
      inPhp = false;
      i += 2;
      continue;
    }
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
      if (language === "java" && source.startsWith('"""', i)) {
        i = quoted(i, '"""');
        continue;
      }
      if (language === "php" && source.startsWith("<<<", i)) {
        const opening =
          /^<<<[ \t]*(?:'([A-Za-z_][\w]*)'|"([A-Za-z_][\w]*)"|([A-Za-z_][\w]*))[ \t]*\r?\n/.exec(
            source.slice(i),
          );
        if (opening) {
          const label = opening[1] ?? opening[2] ?? opening[3];
          const closing = new RegExp(`^[ \\t]*${label}(?![\\w])`, "gm");
          closing.lastIndex = i + opening[0].length;
          const match = closing.exec(source);
          i = match ? closing.lastIndex : length;
          continue;
        }
      }
      if (language === "php" && c === "#" && source[i + 1] !== "[") {
        i = lineComment(i);
        continue;
      }
      if ((language === "php" || language === "custom") && c === "`") {
        i = quoted(i, "`");
        continue;
      }
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
      // Prefer the longer opener when custom rules share a prefix.
      if (
        line &&
        source.startsWith(line, i) &&
        !(
          blockStart &&
          blockStart.length > line.length &&
          source.startsWith(blockStart, i)
        )
      ) {
        i = lineComment(i);
        continue;
      }
      if (blockStart && source.startsWith(blockStart, i)) {
        const start = i;
        let depth = 1;
        i += blockStart.length;
        while (i < length && depth > 0) {
          if (language === "rust" && source.startsWith("/*", i)) {
            depth++;
            i += 2;
          } else if (source.startsWith(blockEnd, i)) {
            depth--;
            i += blockEnd.length;
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
