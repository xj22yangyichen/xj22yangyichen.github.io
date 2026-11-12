import type { SiteLocale } from "@/lib/site-config";

export const localePreferenceKey = "blog-locale";

export function getPreferredLocale(
  browserLanguage: string,
  savedLocale: string | null,
): SiteLocale {
  if (savedLocale === "zh-CN" || savedLocale === "en") return savedLocale;

  return /^zh(?:-|$)/iu.test(browserLanguage) ? "zh-CN" : "en";
}
