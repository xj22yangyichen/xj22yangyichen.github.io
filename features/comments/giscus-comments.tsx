"use client";

import { Button } from "@heroui/react/button";
import { Spinner } from "@heroui/react/spinner";
import { MessageSquareText, RotateCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import type { GiscusConfig } from "@/lib/giscus/config";
import type { SiteLocale } from "@/lib/site-config";

const commentsContent = {
  "zh-CN": {
    disabled: "评论暂未开放。",
    error: "评论暂时无法加载，正文阅读不受影响。",
    loading: "正在加载评论",
    retry: "重新加载",
    title: "评论",
    notice: "使用 GitHub 登录后参与讨论，评论将公开显示，支持 Markdown 格式。",
    manage: "如需编辑或删除自己的评论，请",
    github: "前往 GitHub 讨论",
    manageHelp: "，在对应评论右上角的“⋯”菜单中操作。",
  },
  en: {
    disabled: "Comments are not open yet.",
    error: "Comments could not load. The article remains available.",
    loading: "Loading comments",
    retry: "Try again",
    title: "Comments",
    notice:
      "Sign in with GitHub to join the discussion. Comments are public and support Markdown.",
    manage: "To edit or delete your own comments, ",
    github: "open the discussion on GitHub",
    manageHelp: " and use the “⋯” menu at the top right of your comment.",
  },
} as const satisfies Record<SiteLocale, object>;

type CommentsStatus = "idle" | "loading" | "ready" | "error" | "disabled";

interface GiscusCommentsProps {
  readonly commentId?: string;
  readonly config: GiscusConfig | null;
  readonly locale: SiteLocale;
}

export function GiscusComments({
  config,
  locale,
  commentId,
}: GiscusCommentsProps) {
  const content = commentsContent[locale];
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const sectionRef = useRef<HTMLElement>(null);
  const latestTheme = useRef(theme);
  const hostRef = useRef<HTMLDivElement>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [discussionUrl, setDiscussionUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<CommentsStatus>(
    config ? "idle" : "disabled",
  );

  useEffect(() => {
    if (!config || loadAttempt > 0) return;
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      const timeoutId = globalThis.setTimeout(() => setLoadAttempt(1), 0);
      return () => globalThis.clearTimeout(timeoutId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setLoadAttempt(1);
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, [config, loadAttempt]);

  useEffect(() => {
    if (!config || !commentId || loadAttempt === 0) return;
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const observer = new MutationObserver(() => {
      const frame = host.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      );
      if (!frame) return;
      frame.addEventListener(
        "load",
        () => {
          if (!cancelled) setStatus("ready");
          clearTimeout(timeoutId);
        },
        { once: true },
      );
      observer.disconnect();
    });
    const fail = () => {
      if (cancelled) return;
      clearTimeout(timeoutId);
      observer.disconnect();
      host.replaceChildren();
      setStatus("error");
    };
    const onMessage = (event: MessageEvent) => {
      const frame = host.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame",
      );
      if (
        event.origin !== "https://giscus.app" ||
        !frame ||
        event.source !== frame.contentWindow
      )
        return;
      const message = event.data?.giscus;
      const url = message?.discussion?.url;
      if (typeof url === "string") {
        try {
          const parsed = new URL(url);
          if (
            parsed.origin === "https://github.com" &&
            parsed.pathname.startsWith(`/${config.repo}/discussions/`)
          )
            setDiscussionUrl(parsed.href);
        } catch {
          /* Ignore malformed third-party metadata. */
        }
      }
    };
    window.addEventListener("message", onMessage);

    host.replaceChildren();
    setStatus("loading");
    setDiscussionUrl(null);
    observer.observe(host, { childList: true, subtree: true });

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.repo = config.repo;
    script.dataset.repoId = config.repoId;
    script.dataset.category = config.category;
    script.dataset.categoryId = config.categoryId;
    script.dataset.mapping = "specific";
    script.dataset.term = `post:${commentId}`;
    script.dataset.strict = "1";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "1";
    script.dataset.inputPosition = "top";
    script.dataset.theme = latestTheme.current;
    script.dataset.lang = locale;
    script.dataset.loading = "lazy";
    script.addEventListener("error", fail, { once: true });
    const timeoutId = setTimeout(fail, 15_000);
    host.append(script);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener("message", onMessage);
      host.replaceChildren();
    };
  }, [config, loadAttempt, locale, commentId]);

  useEffect(() => {
    latestTheme.current = theme;
    if (status !== "ready") return;
    const frame = hostRef.current?.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    frame?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      "https://giscus.app",
    );
  }, [status, theme]);

  return (
    <section
      aria-labelledby="article-comments-title"
      className="article-comments"
      data-giscus-theme={theme}
      data-status={status}
      data-testid="article-comments"
      ref={sectionRef}
    >
      <header className="article-comments-header">
        <MessageSquareText aria-hidden="true" />
        <h2 id="article-comments-title">{content.title}</h2>
      </header>

      {config ? (
        <p className="article-comments-message article-comments-notice">
          {content.notice}
          <br />
          {content.manage}
          <a
            href={
              discussionUrl ??
              `https://github.com/${config.repo}/discussions?discussions_q=${encodeURIComponent(`"post:${commentId}"`)}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.github}
          </a>
          {content.manageHelp}
        </p>
      ) : null}

      {status === "disabled" ? (
        <p className="article-comments-message">{content.disabled}</p>
      ) : null}
      {status === "loading" ? (
        <div aria-live="polite" className="article-comments-loading">
          <Spinner aria-label={content.loading} size="sm" />
          <span>{content.loading}</span>
        </div>
      ) : null}
      {status === "error" ? (
        <div aria-live="polite" className="article-comments-error">
          <p>{content.error}</p>
          <Button
            onPress={() => setLoadAttempt((attempt) => attempt + 1)}
            size="sm"
            variant="ghost"
          >
            <RotateCw aria-hidden="true" />
            {content.retry}
          </Button>
        </div>
      ) : null}

      <div className="article-comments-host" ref={hostRef} />
    </section>
  );
}
