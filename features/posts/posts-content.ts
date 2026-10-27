import type { SiteLocale } from "@/lib/site-config";

export const postsContent = {
  "zh-CN": {
    allTopics: "全部",
    count: (count: number) => `共 ${count} 篇`,
    description: "从工程实践到产品思考，按自己的节奏持续记录。",
    emptyDescription: "新的记录会陆续出现在这里。",
    emptyTitle: "还没有发布文章",
    nextPage: "下一页",
    previousPage: "上一页",
    title: "所有文章",
  },
  en: {
    allTopics: "All",
    count: (count: number) => `${count} ${count === 1 ? "post" : "posts"}`,
    description:
      "Engineering notes and product thinking, written at a sustainable pace.",
    emptyDescription: "New notes will appear here as they are published.",
    emptyTitle: "No writing here yet",
    nextPage: "Next",
    previousPage: "Previous",
    title: "All writing",
  },
} as const satisfies Record<SiteLocale, object>;

export const articleContent = {
  "zh-CN": {
    back: "返回所有文章",
    contents: "本文目录",
    minutes: "分钟阅读",
    navigation: "文章导航",
    next: "下一篇",
    previous: "上一篇",
    words: "字",
  },
  en: {
    back: "Back to all writing",
    contents: "On this page",
    minutes: "min read",
    navigation: "Article navigation",
    next: "Next post",
    previous: "Previous post",
    words: "words",
  },
} as const satisfies Record<SiteLocale, object>;
