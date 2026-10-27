import type { SiteLocale } from "@/lib/site-config";

export const homeContent = {
  "zh-CN": {
    readArticles: "阅读文章",
    topicsTitle: "主题",
    recentTitle: "近期文章",
    viewAll: "查看全部",
    readPost: "阅读全文",
  },
  en: {
    readArticles: "Read writing",
    topicsTitle: "Topics",
    recentTitle: "Recent writing",
    viewAll: "View all",
    readPost: "Read post",
  },
} as const satisfies Record<SiteLocale, object>;
