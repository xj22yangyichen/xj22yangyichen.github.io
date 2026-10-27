// Next.js static export requires at least one generated path per dynamic route.
// Empty collections use a reserved path whose page renders notFound().
export const emptyContentSegment = "__empty__";

export function ensureStaticParams<T extends Record<string, string>>(
  params: T[],
  emptyParams: T,
): T[] {
  return params.length > 0 ? params : [emptyParams];
}
