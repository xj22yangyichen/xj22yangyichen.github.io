import type { LocalizedText } from "@/site.config";

export type ToolCategory = "text" | "math" | "time";

interface Tool {
  readonly slug: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly category: LocalizedText;
  readonly categoryId: ToolCategory;
}

export const base64Tool = {
  categoryId: "text",
  slug: "base64",
  title: { "zh-CN": "Base64 编码与解码", en: "Base64 encoder & decoder" },
  description: {
    "zh-CN": "在文本与 Base64 之间轻松转换，支持中文与 emoji。",
    en: "Convert between text and Base64, with support for Unicode and emoji.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const asciiTool = {
  categoryId: "text",
  slug: "ascii",
  title: { "zh-CN": "ASCII 编码与解码", en: "ASCII encoder & decoder" },
  description: {
    "zh-CN": "在文本与十进制 ASCII 码之间转换，数字以空格分隔。",
    en: "Convert between text and decimal ASCII codes, separated by spaces.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const diffTool = {
  categoryId: "text",
  slug: "diff",
  title: { "zh-CN": "文本对比", en: "Text diff" },
  description: {
    "zh-CN": "比较两段文本，快速找到新增、删除与修改。",
    en: "Compare two texts to see exactly what was added, removed or changed.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const regexTool = {
  categoryId: "text",
  slug: "regex",
  title: { "zh-CN": "正则表达式匹配", en: "Regular expression tester" },
  description: {
    "zh-CN": "检查字符串是否匹配 JavaScript 正则表达式。",
    en: "Check whether a string matches a JavaScript regular expression.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const matrixTools = {
  solve: {
    categoryId: "math",
    slug: "linear-equations",
    title: { "zh-CN": "线性方程组求解", en: "Linear equation solver" },
    description: {
      "zh-CN": "求解 Ax = b，判断唯一解、无解或无穷多解，并给出通解。",
      en: "Solve Ax = b, identify unique, inconsistent or infinite solutions, and find the general solution.",
    },
    category: { "zh-CN": "数学工具", en: "Math tools" },
  },
  multiply: {
    categoryId: "math",
    slug: "matrix-multiply",
    title: { "zh-CN": "矩阵乘法", en: "Matrix multiplication" },
    description: {
      "zh-CN": "计算两个矩阵的乘积 A × B。",
      en: "Calculate the product of two matrices, A × B.",
    },
    category: { "zh-CN": "数学工具", en: "Math tools" },
  },
  eigenvalues: {
    categoryId: "math",
    slug: "matrix-eigenvalues",
    title: { "zh-CN": "求矩阵特征值", en: "Matrix eigenvalues" },
    description: {
      "zh-CN": "求实方阵的特征值，支持实数与复数结果。",
      en: "Find the real and complex eigenvalues of a real square matrix.",
    },
    category: { "zh-CN": "数学工具", en: "Math tools" },
  },
  inverse: {
    categoryId: "math",
    slug: "matrix-inverse",
    title: { "zh-CN": "矩阵求逆", en: "Matrix inverse" },
    description: {
      "zh-CN": "计算可逆方阵的逆矩阵。",
      en: "Calculate the inverse of an invertible square matrix.",
    },
    category: { "zh-CN": "数学工具", en: "Math tools" },
  },
} as const satisfies Record<string, Tool>;

export type MatrixOperation = keyof typeof matrixTools;

export const integerTools = {
  prime: {
    categoryId: "math",
    slug: "primality",
    title: { "zh-CN": "质数判断", en: "Primality test" },
    description: {
      "zh-CN": "准确判断一个整数是否为质数，支持 2^60 以内的数字。",
      en: "Check whether an integer is prime, with exact results up to 2^60.",
    },
    category: { "zh-CN": "数学工具", en: "Math tools" },
  },
  factor: {
    categoryId: "math",
    slug: "prime-factorization",
    title: { "zh-CN": "质因数分解", en: "Prime factorization" },
    description: {
      "zh-CN": "将整数分解为质因数的乘积，支持 2^60 以内的数字。",
      en: "Factor an integer into primes, with exact results up to 2^60.",
    },
    category: { "zh-CN": "数学工具", en: "Math tools" },
  },
} as const satisfies Record<string, Tool>;

export type IntegerOperation = keyof typeof integerTools;

export const timestampTool = {
  categoryId: "time",
  slug: "timestamp",
  title: { "zh-CN": "Unix 时间戳转换", en: "Unix timestamp converter" },
  description: {
    "zh-CN": "在日期时间与 Unix 时间戳之间双向转换，支持秒、毫秒与时区选择。",
    en: "Convert between dates and Unix timestamps, with seconds, milliseconds and time zones.",
  },
  category: { "zh-CN": "时间工具", en: "Time tools" },
} as const satisfies Tool;

export const commentRemoverTool = {
  categoryId: "text",
  slug: "comment-remover",
  title: { "zh-CN": "删除代码注释", en: "Code comment remover" },
  description: {
    "zh-CN":
      "删除 C/C++、Rust、Python、Go、Java、JavaScript 和 PHP 代码中的注释，支持自定义注释规则。",
    en: "Remove comments from C/C++, Rust, Python, Go, Java, JavaScript and PHP, or define custom comment rules.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const radixTool = {
  categoryId: "math",
  slug: "radix",
  title: { "zh-CN": "进制转换", en: "Number base converter" },
  description: {
    "zh-CN": "在 2–36 进制之间转换数字，支持大整数、负数与小数。",
    en: "Convert numbers between bases 2–36, including large integers, negatives and fractions.",
  },
  category: { "zh-CN": "数学工具", en: "Math tools" },
} as const satisfies Tool;

export const tools: readonly Tool[] = [
  commentRemoverTool,
  base64Tool,
  asciiTool,
  diffTool,
  regexTool,
  radixTool,
  ...Object.values(matrixTools),
  ...Object.values(integerTools),
  timestampTool,
];

export const toolboxCopy = {
  "zh-CN": {
    title: "工具箱",
    description: "把日常的小事，做得简单一点。",
  },
  en: {
    title: "Tools",
    description: "Small tools to make everyday tasks a little easier.",
  },
} as const;
