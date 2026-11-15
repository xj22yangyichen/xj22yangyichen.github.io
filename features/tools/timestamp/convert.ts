export type TimestampUnit = "seconds" | "milliseconds";
export type TimeZone = "local" | "utc" | "beijing";

function parts(
  date: Date,
  zone: TimeZone,
): [number, number, number, number, number, number, number] {
  const d = zone === "beijing" ? new Date(date.getTime() + 28_800_000) : date;
  return zone === "local"
    ? [
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
        d.getMilliseconds(),
      ]
    : [
        d.getUTCFullYear(),
        d.getUTCMonth() + 1,
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds(),
      ];
}

export function formatDateTime(date: Date, zone: TimeZone): string {
  const [year, month, day, hour, minute, second, ms] = parts(date, zone);
  if (!Number.isFinite(date.getTime()) || year < 1 || year > 9999)
    throw new Error("range");
  const pad = (value: number, width = 2) => String(value).padStart(width, "0");
  return `${pad(year, 4)}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(ms, 3)}`;
}

export function parseDateTime(input: string, zone: TimeZone): Date {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
      input.trim(),
    );
  if (!match) throw new Error("date");
  const values = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
    Number((match[7] ?? "").padEnd(3, "0")),
  ] as const;
  const [year, month, day, hour, minute, second, ms] = values;
  if (year < 1) throw new Error("date");
  const date = new Date(0);
  if (zone === "local") {
    date.setFullYear(year, month - 1, day);
    date.setHours(hour, minute, second, ms);
  } else {
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second, ms);
    if (zone === "beijing") date.setTime(date.getTime() - 28_800_000);
  }
  // Reject invalid calendar dates and local times skipped by daylight saving.
  if (parts(date, zone).some((value, index) => value !== values[index]))
    throw new Error("date");
  return date;
}

export function timestampToDate(
  input: string,
  unit: TimestampUnit,
  zone: TimeZone,
): string {
  const value = input.trim();
  if (
    value.length > 30 ||
    !(unit === "seconds" ? /^[+-]?\d+(?:\.\d{1,3})?$/ : /^[+-]?\d+$/).test(
      value,
    )
  )
    throw new Error("timestamp");
  const [whole = "0", fraction = ""] = value.replace(/^[+-]/, "").split(".");
  const magnitude =
    unit === "seconds"
      ? BigInt(whole) * BigInt(1000) + BigInt(fraction.padEnd(3, "0"))
      : BigInt(whole);
  const ms = Number(value.startsWith("-") ? -magnitude : magnitude);
  if (!Number.isSafeInteger(ms)) throw new Error("range");
  return formatDateTime(new Date(ms), zone);
}

export function dateToTimestamp(
  input: string,
  unit: TimestampUnit,
  zone: TimeZone,
): string {
  const ms = parseDateTime(input, zone).getTime();
  return String(unit === "seconds" ? ms / 1000 : ms);
}
