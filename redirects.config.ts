import type { RedirectConfiguration } from "@/lib/redirects/types";

export const redirectsConfig: RedirectConfiguration = {
  paths: [
    { from: "/archives/", to: "/posts/" },
    { from: "/en/archives/", to: "/en/posts/" },
    { from: "/about/", to: "/" },
    { from: "/en/about/", to: "/en/" },
  ],
  postSlugs: [
    { from: "cnblogs-19638493", to: "ru-he-commit" },
    {
      from: "cnblogs-17688982",
      to: "poj2411-mondriaans-dream-duo-mi-nuo-mi-pu-wen-ti",
    },
    { from: "cnblogs-17013995", to: "chang-jian-de-luo-ji-miu-wu" },
    { from: "cnblogs-16947240", to: "chang-shu-you-hua-1" },
    { from: "cnblogs-16947247", to: "chang-shu-you-hua-2" },
    {
      from: "cnblogs-16947230",
      to: "tou-wen-jian-numeric-xia-de-ji-ge-shi-yong-han-shu",
    },
    { from: "cnblogs-16947209", to: "valarray" },
  ],
};
