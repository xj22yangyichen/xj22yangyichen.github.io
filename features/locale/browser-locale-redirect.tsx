"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  getPreferredLocale,
  localePreferenceKey,
} from "@/lib/locale-preference";

export function BrowserLocaleRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    // Explicit content and English URLs keep their requested language.
    if (pathname !== "/") return;

    const url = new URL(window.location.href);
    let savedLocale = url.searchParams.get("lang");
    if (savedLocale !== "zh-CN" && savedLocale !== "en") {
      try {
        savedLocale = localStorage.getItem(localePreferenceKey);
      } catch {
        // Browser language detection still works when storage is unavailable.
      }
    }

    const language = navigator.languages?.[0] || navigator.language;
    if (getPreferredLocale(language, savedLocale) === "en") {
      url.pathname = "/en/";
      window.location.replace(url.href);
    }
  }, [pathname]);

  return null;
}
