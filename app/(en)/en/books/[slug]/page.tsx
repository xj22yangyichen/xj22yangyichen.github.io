import {
  ensureStaticParams,
  emptyContentSegment,
} from "@/lib/deployment/static-params";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookDetailPage } from "@/features/books/book-detail-page";
import { decodeBookSegment } from "@/features/books/book-links";
import {
  findBookTranslation,
  findPublishedBook,
  getPublishedBooks,
} from "@/lib/content/queries";
import { getAllBooks } from "@/lib/content/repository";
import { buildBookMetadata } from "@/lib/seo/content-metadata";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

interface BookRouteProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const books = getPublishedBooks(await getAllBooks(), "en");

  return ensureStaticParams(
    books.map(({ slug }) => ({ slug })),
    { slug: emptyContentSegment },
  );
}

export async function generateMetadata({
  params,
}: BookRouteProps): Promise<Metadata> {
  const [{ slug }, books] = await Promise.all([params, getAllBooks()]);
  const decodedSlug = decodeBookSegment(slug);
  const book = findPublishedBook(books, "en", decodedSlug);

  return book
    ? buildBookMetadata(book, findBookTranslation(books, book, "zh-CN"))
    : buildPageMetadata({
        alternatePaths: { en: `/en/books/${decodedSlug}/` },
        description: "There is no book at this address.",
        locale: "en",
        noIndex: true,
        pathname: `/en/books/${decodedSlug}/`,
        title: "Book not found",
      });
}

export default async function EnglishBookPage({ params }: BookRouteProps) {
  const [{ slug }, books] = await Promise.all([params, getAllBooks()]);

  const book = findPublishedBook(books, "en", decodeBookSegment(slug));

  if (!book) {
    notFound();
  }

  return <BookDetailPage book={book} />;
}
