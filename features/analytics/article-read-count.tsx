"use client";

import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import type { SiteLocale } from "@/lib/site-config";

type CountState =
  | { status: "loading" }
  | { status: "ready"; count: number }
  | { status: "unavailable" };

// Mounted with an article key so navigation never displays the previous count.
export function ArticleReadCount({ locale }: { readonly locale: SiteLocale }) {
  const [state, setState] = useState<CountState>({ status: "loading" });

  useEffect(() => {
    const callback = `blogReadCount_${crypto.randomUUID().replaceAll("-", "")}`;
    const script = document.createElement("script");
    let active = true;
    const fail = () => {
      if (active) setState({ status: "unavailable" });
    };
    const timeout = window.setTimeout(fail, 8000);
    Reflect.set(window, callback, (data: unknown) => {
      window.clearTimeout(timeout);
      if (!active) return;
      const count =
        data && typeof data === "object"
          ? Reflect.get(data, "page_pv")
          : undefined;
      if (
        typeof count === "number" &&
        Number.isSafeInteger(count) &&
        count >= 0
      ) {
        setState({ status: "ready", count });
      } else {
        fail();
      }
    });
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callback}`;
    script.async = true;
    // The service uses the page's full referrer as its article identifier.
    script.referrerPolicy = "no-referrer-when-downgrade";
    script.onerror = fail;
    // Deferring lets React's development effect replay cancel the first request.
    const start = window.setTimeout(() => document.head.appendChild(script), 0);

    return () => {
      active = false;
      window.clearTimeout(start);
      window.clearTimeout(timeout);
      script.remove();
      // A response already in flight may still execute after navigation.
      Reflect.set(window, callback, () => {});
      window.setTimeout(() => Reflect.deleteProperty(window, callback), 60_000);
    };
  }, []);

  const label = locale === "zh-CN" ? "阅读量" : "Views";
  const value =
    state.status === "ready"
      ? new Intl.NumberFormat(locale).format(state.count)
      : state.status === "loading"
        ? "…"
        : "—";
  const title =
    state.status === "unavailable"
      ? locale === "zh-CN"
        ? "阅读量暂不可用"
        : "View count unavailable"
      : `${label} ${value}`;

  return (
    <span
      aria-live="polite"
      aria-label={title}
      className="article-view-stats"
      data-state={state.status}
      data-testid="article-view-stats"
      title={title}
    >
      <Eye aria-hidden="true" />
      <span>
        {label} {value}
      </span>
    </span>
  );
}
