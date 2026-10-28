// Public build-time settings only. Keep credentials and private API keys in environment variables.
export const supportedLocales = ["zh-CN", "en"] as const;

export type SiteLocale = (typeof supportedLocales)[number];
export type LocalizedText = Readonly<Record<SiteLocale, string>>;
export type SocialPlatform = "github" | "zhihu";
export type TechnologyStage = "adopt" | "assess" | "trial";

export type AdPlacementName = "article" | "home" | "posts";
export type AdvertisingProvider = "adsense" | "custom";

export interface CustomAdvertisementConfig {
  readonly description: LocalizedText;
  readonly href: string;
  readonly image: {
    readonly alt: LocalizedText;
    readonly src: string;
  };
  readonly title: LocalizedText;
}

export interface AdPlacementConfig {
  readonly custom: CustomAdvertisementConfig;
  readonly enabled: boolean;
  readonly provider: AdvertisingProvider;
  readonly slotId: string;
}

export interface AdvertisingConfig {
  readonly adsenseClientId: string;
  readonly placements: Readonly<Record<AdPlacementName, AdPlacementConfig>>;
}

export interface SponsorshipConfig {
  readonly copy: {
    readonly close: LocalizedText;
    readonly description: LocalizedText;
    readonly modalTitle: LocalizedText;
    readonly qrCodeAlt: LocalizedText;
    readonly title: LocalizedText;
    readonly trigger: LocalizedText;
    readonly unavailable: LocalizedText;
  };
  readonly enabled: boolean;
  readonly qrCodeSrc: string;
}

export interface UmamiAnalyticsConfig {
  readonly apiPath: string;
  readonly baseUrl: string;
  readonly enabled: boolean;
  readonly provider: "umami";
  readonly shareId: string;
  readonly showPageViews: boolean;
  readonly timezone: string;
  readonly websiteId: string;
}

export interface GoogleAnalyticsConfig {
  readonly enabled: boolean;
  readonly measurementId: string;
}

export interface CloudflareWebAnalyticsConfig {
  readonly enabled: boolean;
  readonly token: string;
}

export interface AiSearchConfig {
  readonly apiEndpoint: string;
  readonly autoragName: string;
  readonly enabled: boolean;
  readonly fallbackScoreThreshold: number;
  readonly maxCitations: number;
  readonly maxQueryLength: number;
  readonly maxRetrievalResults: number;
  readonly model: string;
  readonly rateLimit: {
    readonly globalRequests: number;
    readonly userRequests: number;
    readonly windowSeconds: number;
  };
  readonly requestTimeoutMs: number;
  readonly rerankerModel: string;
  readonly scoreThreshold: number;
}

export interface ProfileStatusConfig {
  readonly github: {
    readonly enabled: boolean;
    readonly username: string;
  };
  readonly reading: {
    readonly enabled: boolean;
    readonly profileUrl: string;
  };
  readonly technologyRadar: readonly {
    readonly name: string;
    readonly stage: TechnologyStage;
  }[];
  readonly tokenBoard: {
    readonly enabled: boolean;
    readonly publicJsonUrl: string;
  };
}

interface PublicSiteConfig {
  readonly author: {
    readonly about: LocalizedText;
    readonly aboutTitle: LocalizedText;
    readonly avatar: {
      readonly alt: LocalizedText;
      readonly src: string;
    };
    readonly bio: LocalizedText;
    readonly homeTitle: LocalizedText;
    readonly name: LocalizedText;
  };
  readonly brand: {
    readonly bookLabel: string;
    readonly description: LocalizedText;
    readonly footerLine: LocalizedText;
    readonly mark: string;
    readonly name: LocalizedText;
    readonly socialImage: string;
    readonly wordmark: string;
  };
  readonly copyrightYear: number;
  readonly defaultLocale: SiteLocale;
  readonly integrations: {
    readonly advertising: AdvertisingConfig;
    readonly aiSearch: AiSearchConfig;
    readonly analytics: UmamiAnalyticsConfig;
    readonly cloudflareWebAnalytics: CloudflareWebAnalyticsConfig;
    readonly comments: {
      readonly category: string;
      readonly categoryId: string;
      readonly enabled: boolean;
      readonly provider: "giscus";
      readonly repo: string;
      readonly repoId: string;
    };
    readonly googleAnalytics: GoogleAnalyticsConfig;
    readonly sponsorship: SponsorshipConfig;
  };
  readonly locales: readonly SiteLocale[];
  readonly profileStatus: ProfileStatusConfig;
  readonly sectionDescriptions: {
    readonly archives: LocalizedText;
    readonly books: LocalizedText;
    readonly links: LocalizedText;
    readonly posts: LocalizedText;
  };
  readonly socialLinks: readonly {
    readonly enabled: boolean;
    readonly href: string;
    readonly label: LocalizedText;
    readonly platform: SocialPlatform;
  }[];
}

const emptyAdvertisement: AdPlacementConfig = {
  custom: {
    description: { "zh-CN": "", en: "" },
    href: "",
    image: { alt: { "zh-CN": "", en: "" }, src: "" },
    title: { "zh-CN": "", en: "" },
  },
  enabled: false,
  provider: "custom",
  slotId: "",
};

export const siteConfig: PublicSiteConfig = {
  author: {
    about: {
      "zh-CN":
        "你好，我是 Yichen Yang，上海交通大学致远学院 ACM 班本科生。这里是我的个人博客，用来记录学习、代码与日常思考。",
      en: "Hi, I'm Yichen Yang, an undergraduate from ACM Class, Zhiyuan College, Shanghai Jiao Tong University. This is my personal blog for learning, code and reflections.",
    },
    aboutTitle: { "zh-CN": "关于 Yichen Yang", en: "About Yichen Yang" },
    avatar: {
      alt: {
        "zh-CN": "Yichen Yang 的 GitHub 头像",
        en: "Yichen Yang's GitHub avatar",
      },
      src: "https://avatars.githubusercontent.com/u/143879124?v=4",
    },
    bio: {
      "zh-CN": "上海交通大学 · 致远学院 ACM 班",
      en: "ACM Class · Zhiyuan College · SJTU",
    },
    homeTitle: {
      "zh-CN": "学习、代码与思考",
      en: "Learning, code and reflections",
    },
    name: { "zh-CN": "Yichen Yang", en: "Yichen Yang" },
  },
  brand: {
    bookLabel: "YICHEN'S NOTES",
    description: {
      "zh-CN": "Yichen Yang 的个人博客，记录学习、编程实践与日常思考。",
      en: "Yichen Yang's personal blog about learning, programming and everyday reflections.",
    },
    footerLine: {
      "zh-CN": "学习、代码与思考",
      en: "Learning, code and reflections",
    },
    mark: "Y",
    name: { "zh-CN": "Yichen Yang 的博客", en: "Yichen Yang's Blog" },
    socialImage: "/images/social-cover.svg",
    wordmark: "YICHEN YANG",
  },
  copyrightYear: 2026,
  defaultLocale: "zh-CN",
  integrations: {
    advertising: {
      adsenseClientId: "",
      placements: {
        article: emptyAdvertisement,
        home: emptyAdvertisement,
        posts: emptyAdvertisement,
      },
    },
    aiSearch: {
      apiEndpoint: "/api/ai-search",
      autoragName: "",
      enabled: false,
      fallbackScoreThreshold: 0.5,
      maxCitations: 5,
      maxQueryLength: 500,
      maxRetrievalResults: 15,
      model: "",
      rateLimit: { globalRequests: 30, userRequests: 6, windowSeconds: 60 },
      requestTimeoutMs: 30000,
      rerankerModel: "",
      scoreThreshold: 0.3,
    },
    analytics: {
      apiPath: "",
      baseUrl: "",
      enabled: false,
      provider: "umami",
      shareId: "",
      showPageViews: false,
      timezone: "Asia/Shanghai",
      websiteId: "",
    },
    cloudflareWebAnalytics: { enabled: false, token: "" },
    comments: {
      category: "",
      categoryId: "",
      enabled: false,
      provider: "giscus",
      repo: "",
      repoId: "",
    },
    googleAnalytics: { enabled: false, measurementId: "" },
    sponsorship: {
      copy: {
        close: { "zh-CN": "关闭", en: "Close" },
        description: {
          "zh-CN": "感谢支持。",
          en: "Thank you for your support.",
        },
        modalTitle: { "zh-CN": "支持本站", en: "Support this blog" },
        qrCodeAlt: { "zh-CN": "赞赏二维码", en: "Sponsorship QR code" },
        title: { "zh-CN": "支持本站", en: "Support this blog" },
        trigger: { "zh-CN": "赞赏", en: "Support" },
        unavailable: {
          "zh-CN": "赞赏暂未开放。",
          en: "Sponsorship is not available.",
        },
      },
      enabled: false,
      qrCodeSrc: "",
    },
  },
  locales: supportedLocales,
  profileStatus: {
    github: { enabled: false, username: "xj22yangyichen" },
    reading: { enabled: false, profileUrl: "" },
    technologyRadar: [],
    tokenBoard: { enabled: false, publicJsonUrl: "" },
  },
  sectionDescriptions: {
    archives: {
      "zh-CN": "按年份浏览我的文章。",
      en: "Browse my writing by year.",
    },
    books: {
      "zh-CN": "我的图书与长文，目前暂无内容。",
      en: "My books and long reads. Nothing published yet.",
    },
    links: {
      "zh-CN": "我的朋友与他们的个人网站。",
      en: "Friends and their personal websites.",
    },
    posts: {
      "zh-CN": "记录学习、编程实践与日常思考。",
      en: "Notes on learning, programming and everyday reflections.",
    },
  },
  socialLinks: [
    {
      enabled: true,
      href: "https://github.com/xj22yangyichen",
      label: { "zh-CN": "GitHub", en: "GitHub" },
      platform: "github",
    },
  ],
};
