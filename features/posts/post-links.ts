import { getLocalizedPath } from "@/lib/i18n";
import type { SiteLocale } from "@/lib/site-config";
import { contentCalendarDate } from "@/lib/content/dates";

export function formatPostDate(date: string, locale: SiteLocale): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(contentCalendarDate(date));
}

export function formatPostDateTime(date: string, locale: SiteLocale): string {
  const formatted = formatPostDate(date, locale);
  if (!date.includes("T")) return formatted;

  const offset = date.endsWith("Z") ? "+00:00" : date.slice(-6);
  return `${formatted} ${date.slice(11, 19)} (UTC${offset})`;
}

export function getPostHref(locale: SiteLocale, slug: string): string {
  return getLocalizedPath(`/posts/${slug}/`, locale);
}

export function decodePostSlug(segment: string): string {
  return decodeURIComponent(segment);
}
