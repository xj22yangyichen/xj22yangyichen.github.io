import { describe, expect, it } from "vitest";
import {
  removeComments,
  validCommentRules,
  type CodeLanguage,
} from "@/features/tools/comment-remover/remove-comments";

describe("code comment removal", () => {
  it.each<CodeLanguage>(["java", "javascript", "php"])(
    "removes ordinary %s comments",
    (language) => {
      expect(
        removeComments(
          'x = "https://host/#text"; /* note */ // end\n',
          language,
        ),
      ).toBe('x = "https://host/#text";   \n');
    },
  );
  it("preserves Java text blocks", () => {
    const code = 'String s = """\n" // text\n/* text */\n""";';
    expect(removeComments(code + "// end", "java")).toBe(code);
  });
  it("handles JavaScript regex, division and nested template expressions", () => {
    const code = "const r = /[/*]+https?:\\/\\//g; const n = {} / 2;";
    expect(removeComments(code + " // end", "javascript")).toBe(code + " ");
    expect(
      removeComments(
        "const s = `// keep ${1 /* note */ + `${2 // end\n}`} /* keep */`;",
        "javascript",
      ),
    ).toBe("const s = `// keep ${1   + `${2 \n}`} /* keep */`;");
    expect(removeComments("if (ok) /[/*]/.test(x); // end", "javascript")).toBe(
      "if (ok) /[/*]/.test(x); ",
    );
    expect(() =>
      removeComments('const s = "unfinished', "javascript"),
    ).toThrow();
  });
  it("preserves PHP attributes, heredoc/nowdoc, strings and HTML outside tags", () => {
    expect(
      removeComments(
        '<?php #[Route("/#path")] // note\n$x = "# keep"; # end\n?> // HTML',
        "php",
      ),
    ).toBe('<?php #[Route("/#path")] \n$x = "# keep"; \n?> // HTML');
    for (const label of ["TEXT", "'TEXT'", '"TEXT"']) {
      const code = `<?php\n$x = <<<${label}\n# keep\n/* keep */\nTEXT;`;
      expect(removeComments(code + " // end", "php")).toBe(code + " ");
    }
    expect(removeComments("<?php // end ?>HTML", "php")).toBe("<?php ?>HTML");
  });
  it("matches literal custom markers, preserves quotes and prefers longer openers", () => {
    expect(
      removeComments('x(* multi\nline *)y; -- end\n"-- keep"', "custom", {
        line: "--",
        blockStart: "(*",
        blockEnd: "*)",
      }),
    ).toBe('x \ny; \n"-- keep"');
    expect(
      removeComments("x // note\ny /* note */ z", "custom", {
        line: "/",
        blockStart: "/*",
        blockEnd: "*/",
      }),
    ).toBe("x \ny   z");
    expect(
      removeComments("x # end\n/* keep */", "custom", {
        line: "#",
        blockStart: "",
        blockEnd: "",
      }),
    ).toBe("x \n/* keep */");
    expect(
      removeComments("x <!-- end --> y // keep", "custom", {
        line: "",
        blockStart: "<!--",
        blockEnd: "-->",
      }),
    ).toBe("x   y // keep");
  });
  it("rejects missing and incomplete custom rules", () => {
    for (const rules of [
      { line: "", blockStart: "", blockEnd: "" },
      { line: "#", blockStart: "/*", blockEnd: "" },
      { line: "\n", blockStart: "", blockEnd: "" },
    ]) {
      expect(validCommentRules(rules)).toBe(false);
      expect(() => removeComments("code", "custom", rules)).toThrow();
    }
  });
  it.each<CodeLanguage>(["cpp", "rust", "python", "go"])(
    "preserves empty and comment-free %s code",
    (language) => {
      expect(removeComments("", language)).toBe("");
      expect(removeComments('  x = "你好 # // /* */"\r\n', language)).toBe(
        '  x = "你好 # // /* */"\r\n',
      );
    },
  );
  it.each<CodeLanguage>(["cpp", "rust", "go"])(
    "removes %s comments without merging tokens",
    (language) => {
      expect(
        removeComments("int/* note */x; // note\r\n/* a\r\nb */x++;", language),
      ).toBe("int x; \r\n \r\nx++;");
      expect(removeComments('"escaped \\" // text"; // end', language)).toBe(
        '"escaped \\" // text"; ',
      );
      expect(removeComments("'/' /* note */ '/'", language)).toBe("'/'   '/'");
    },
  );
  it("preserves C++ raw strings, prefixed characters and digit separators", () => {
    const code = `auto s = u8R"tag(// " /* hello */)tag";\nauto c = u'a';\nauto n = 1'000;`;
    expect(removeComments(code + "// end", "cpp")).toBe(code);
    expect(removeComments("x;// a\\\ncontinued\ny;", "cpp")).toBe("x;\n\ny;");
  });
  it("handles Rust nested comments, lifetimes, labels and raw byte strings", () => {
    const code = `fn f<'a>(s: &'a str) { 'outer: loop { break 'outer; } }\nlet s = br##"// /* */"##;`;
    expect(removeComments(code + "/* a /* b */ c */", "rust")).toBe(code + " ");
    expect(
      removeComments(
        "/// docs\n//! docs\nlet c = '\\u{1F600}'; // end",
        "rust",
      ),
    ).toBe("\n\nlet c = '\\u{1F600}'; ");
  });
  it("preserves Go multiline raw strings", () => {
    const code = "s := `hello //\n/* text */`";
    expect(removeComments(code + " // end", "go")).toBe(code + " ");
  });
  it("preserves Python docstrings, raw strings and hashes within strings", () => {
    const code = `"""Documentation # stays\nwith // text"""\ns = r'# text'\ns = '''# text'''`;
    expect(removeComments(code + " # end\n# comment", "python")).toBe(
      code + " \n",
    );
  });
  it("handles Python formatted strings with nested quotes and expression comments", () => {
    expect(removeComments('f"{data["#key"]} # text" # end', "python")).toBe(
      'f"{data["#key"]} # text" ',
    );
    expect(removeComments('f"""{value # comment\n} # text"""', "python")).toBe(
      'f"""{value \n} # text"""',
    );
    expect(removeComments('f"{42:#x}" # comment', "python")).toBe(
      'f"{42:#x}" ',
    );
  });
  it("retains unfinished strings and removes unfinished comments through EOF", () => {
    expect(removeComments('"// unfinished', "cpp")).toBe('"// unfinished');
    expect(removeComments("x/* unfinished\n", "cpp")).toBe("x \n");
  });
});
