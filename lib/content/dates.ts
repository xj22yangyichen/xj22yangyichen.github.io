export function parseContentDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
}

// Keep the author's calendar date even when a timestamp includes a UTC offset.
export function contentCalendarDate(value: string): Date {
  return parseContentDate(value.slice(0, 10));
}
