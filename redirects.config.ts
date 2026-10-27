import type { RedirectConfiguration } from "@/lib/redirects/types";

export const redirectsConfig: RedirectConfiguration = {
  paths: [
    { from: "/archives/", to: "/posts/" },
    { from: "/en/archives/", to: "/en/posts/" },
  ],
  postSlugs: [],
};
