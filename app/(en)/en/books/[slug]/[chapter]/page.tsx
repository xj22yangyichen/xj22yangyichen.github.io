import {
  ensureStaticParams,
  emptyContentSegment,
} from "@/lib/deployment/static-params";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookChapterPage } from "@/features/books/book-chapter-page";
import { decodeBookSegment } from "@/features/books/book-links";
import {
  findBookChapterTranslation,
  findPublishedBook,
  findPublishedBookChapter,
  getBookChapterNavigation,
  getPublishedBookChapters,
  getPublishedBooks,
} from "@/lib/content/queries";
import { getAllBooks } from "@/lib/content/repository";
import { buildBookChapterMetadata } from "@/lib/seo/content-metadata";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

interface BookChapterRouteProps {
  readonly params: Promise<{ chapter: string; slug: string }>;
}

export async function generateStaticParams() {
  const books = getPublishedBooks(await getAllBooks(), "en");
  const chapters = books.flatMap((book) =>
    getPublishedBookChapters(book).map((chapter) => ({
      chapter: chapter.slug,
      slug: book.slug,
    })),
  );

  return ensureStaticParams(chapters, {
    slug: emptyContentSegment,
    chapter: emptyContentSegment,
  });
}

export async function generateMetadata({
  params,
}: BookChapterRouteProps): Promise<Metadata> {
  const [segments, books] = await Promise.all([params, getAllBooks()]);
  const slug = decodeBookSegment(segments.slug);
  const chapterSlug = decodeBookSegment(segments.chapter);
  const book = findPublishedBook(books, "en", slug);
  const chapter = book ? findPublishedBookChapter(book, chapterSlug) : null;

  return book && chapter
    ? buildBookChapterMetadata(
        book,
        chapter,
        findBookChapterTranslation(books, book, chapter, "zh-CN"),
      )
    : buildPageMetadata({
        alternatePaths: {
          en: `/en/books/${slug}/${chapterSlug}/`,
        },
        description: "There is no book chapter at this address.",
        locale: "en",
        noIndex: true,
        pathname: `/en/books/${slug}/${chapterSlug}/`,
        title: "Chapter not found",
      });
}

export default async function EnglishBookChapterPage({
  params,
}: BookChapterRouteProps) {
  const [segments, books] = await Promise.all([params, getAllBooks()]);

  const book = findPublishedBook(books, "en", decodeBookSegment(segments.slug));
  const chapter = book
    ? findPublishedBookChapter(book, decodeBookSegment(segments.chapter))
    : null;

  if (!book || !chapter) {
    notFound();
  }

  return (
    <BookChapterPage
      book={book}
      chapter={chapter}
      navigation={getBookChapterNavigation(book, chapter)}
    />
  );
}
