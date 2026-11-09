import "server-only";

import { cache } from "react";

import { loadSiteArticles, loadBooks } from "@/lib/content/reader";

export const getAllArticles = cache(async () => loadSiteArticles());
export const getAllBooks = cache(async () => loadBooks());
