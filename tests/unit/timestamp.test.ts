import { describe, expect, it } from "vitest";
import {
  dateToTimestamp,
  timestampToDate,
} from "@/features/tools/timestamp/convert";

describe("Unix timestamp conversion", () => {
  it("converts the epoch and fixed time zone offsets", () => {
    expect(timestampToDate("0", "seconds", "utc")).toBe(
      "1970-01-01 00:00:00.000",
    );
    expect(timestampToDate("0", "seconds", "beijing")).toBe(
      "1970-01-01 08:00:00.000",
    );
    expect(dateToTimestamp("1970-01-01 08:00", "seconds", "beijing")).toBe("0");
  });
  it.each(["0", "-1", "-0.001", "1709251200.123", "253402300799.999"])(
    "round trips seconds without losing milliseconds: %s",
    (value) => {
      expect(
        dateToTimestamp(
          timestampToDate(value, "seconds", "utc"),
          "seconds",
          "utc",
        ),
      ).toBe(value);
    },
  );
  it("supports milliseconds, leap years and years below 100", () => {
    expect(
      dateToTimestamp("2024-02-29 12:34:56.789", "milliseconds", "utc"),
    ).toBe("1709210096789");
    const date = "0001-01-01 00:00:00.000";
    expect(
      timestampToDate(
        dateToTimestamp(date, "milliseconds", "utc"),
        "milliseconds",
        "utc",
      ),
    ).toBe(date);
  });
  it.each([
    "2023-02-29 12:00",
    "2024-04-31 00:00",
    "2024-13-01 00:00",
    "2024-01-01 24:00",
    "2024-01-01 00:00:60",
    "0000-01-01 00:00",
    "hello",
    "2024-01-01",
  ])("rejects invalid date %s", (value) => {
    expect(() => dateToTimestamp(value, "seconds", "utc")).toThrow();
  });
  it.each([
    "",
    "1e3",
    "NaN",
    "Infinity",
    "1.1234",
    "253402300800",
    "9999999999999999999999",
  ])("rejects invalid timestamp %s", (value) => {
    expect(() => timestampToDate(value, "seconds", "utc")).toThrow();
  });
  it("rejects fractional milliseconds and round trips browser local time", () => {
    expect(() => timestampToDate("1.5", "milliseconds", "utc")).toThrow();
    const date = "2026-01-15 12:34:56.789";
    expect(
      timestampToDate(
        dateToTimestamp(date, "milliseconds", "local"),
        "milliseconds",
        "local",
      ),
    ).toBe(date);
  });
});
