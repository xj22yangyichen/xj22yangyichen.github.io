import { GitFork, MessageCircle, Rss } from "lucide-react";
import Image from "next/image";

import { getLocalizedPath } from "@/lib/i18n";
import {
  getLocalizedSiteConfig,
  siteConfig,
  type SiteLocale,
} from "@/lib/site-config";

import { aboutContent } from "./about-content";

interface AboutPageViewProps {
  readonly locale: SiteLocale;
}

const socialIcons = {
  github: GitFork,
  zhihu: MessageCircle,
} as const;

export function AboutPageView({ locale }: AboutPageViewProps) {
  const identity = getLocalizedSiteConfig(locale);
  const content = aboutContent[locale];

  return (
    <main className="about-page">
      <section
        aria-labelledby="about-page-title"
        className="about-page-hero shell"
      >
        <div className="about-page-intro">
          <div className="about-page-meta">
            <span>{content.heroMeta}</span>
          </div>
          <h1 id="about-page-title">{identity.aboutTitle}</h1>
          <p>{identity.about}</p>
        </div>

        <aside aria-label={content.profileLabel} className="about-identity">
          <Image
            alt={identity.authorAvatarAlt}
            className="about-avatar"
            height={112}
            priority
            referrerPolicy="no-referrer"
            src={siteConfig.author.avatar.src}
            width={112}
          />
          <div className="about-identity-copy">
            <div>
              <h2>{identity.authorName}</h2>
              <p>{identity.authorBio}</p>
            </div>
            <nav
              aria-label={locale === "en" ? "Social profiles" : "社交媒体"}
              className="about-social-links"
            >
              {siteConfig.socialLinks
                .filter((link) => link.enabled)
                .map((link) => {
                  const Icon = socialIcons[link.platform];
                  return (
                    <a
                      href={link.href}
                      key={link.platform}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon aria-hidden="true" />
                      {link.label[locale]}
                    </a>
                  );
                })}
              <a href={getLocalizedPath("/rss.xml", locale)}>
                <Rss aria-hidden="true" />
                RSS
              </a>
            </nav>
          </div>
        </aside>
      </section>
    </main>
  );
}
