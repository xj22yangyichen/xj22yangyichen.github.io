import type { LocalizedText } from "@/site.config";

interface Tool {
  readonly slug: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly category: LocalizedText;
}

export const base64Tool = {
  slug: "base64",
  title: { "zh-CN": "Base64 编码与解码", en: "Base64 encoder & decoder" },
  description: {
    "zh-CN": "在文本与 Base64 之间轻松转换，支持中文与 emoji。",
    en: "Convert between text and Base64, with support for Unicode and emoji.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const asciiTool = {
  slug: "ascii",
  title: { "zh-CN": "ASCII 编码与解码", en: "ASCII encoder & decoder" },
  description: {
    "zh-CN": "在文本与十进制 ASCII 码之间转换，数字以空格分隔。",
    en: "Convert between text and decimal ASCII codes, separated by spaces.",
  },
  category: { "zh-CN": "文本工具", en: "Text tools" },
} as const satisfies Tool;

export const tools: readonly Tool[] = [base64Tool, asciiTool];

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
