import {
  clockFieldsFromDate,
  clockFieldsFromIso,
  combineDateAndTime,
  formatClockTime,
  formatLongDate,
  HOUR_OPTIONS,
  localDateOf,
  MINUTE_OPTIONS,
  to24Hour,
} from "../datetime";

describe("formatLongDate", () => {
  it("formats a date as DD - MMMM - AAAA with an English month name", () => {
    expect(formatLongDate("2026-03-05")).toBe("05 - March - 2026");
    expect(formatLongDate("2026-08-27")).toBe("27 - August - 2026");
    expect(formatLongDate("2026-12-31")).toBe("31 - December - 2026");
  });

  it("zero-pads single-digit days", () => {
    expect(formatLongDate("2026-01-09")).toBe("09 - January - 2026");
  });

  it("covers every month name", () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    months.forEach((name, i) => {
      const mm = String(i + 1).padStart(2, "0");
      expect(formatLongDate(`2026-${mm}-15`)).toBe(`15 - ${name} - 2026`);
    });
  });
});

describe("time picker options", () => {
  it("HOUR_OPTIONS is '1' through '12'", () => {
    expect(HOUR_OPTIONS).toHaveLength(12);
    expect(HOUR_OPTIONS[0]).toBe("1");
    expect(HOUR_OPTIONS[11]).toBe("12");
  });

  it("MINUTE_OPTIONS is zero-padded '00' through '59'", () => {
    expect(MINUTE_OPTIONS).toHaveLength(60);
    expect(MINUTE_OPTIONS[0]).toBe("00");
    expect(MINUTE_OPTIONS[5]).toBe("05");
    expect(MINUTE_OPTIONS[59]).toBe("59");
  });
});

describe("to24Hour", () => {
  it("converts AM times", () => {
    expect(to24Hour(12, 0, "AM")).toEqual({ hours: 0, minutes: 0 }); // midnight
    expect(to24Hour(7, 15, "AM")).toEqual({ hours: 7, minutes: 15 });
    expect(to24Hour(11, 59, "AM")).toEqual({ hours: 11, minutes: 59 });
  });

  it("converts PM times", () => {
    expect(to24Hour(12, 30, "PM")).toEqual({ hours: 12, minutes: 30 }); // noon
    expect(to24Hour(1, 0, "PM")).toEqual({ hours: 13, minutes: 0 });
    expect(to24Hour(11, 45, "PM")).toEqual({ hours: 23, minutes: 45 });
  });
});

describe("clockFieldsFromDate / clockFieldsFromIso", () => {
  it("splits a local Date into { hour12, minute, meridiem }", () => {
    expect(clockFieldsFromDate(new Date(2026, 7, 27, 0, 5))).toEqual({
      hour12: 12,
      minute: 5,
      meridiem: "AM",
    });
    expect(clockFieldsFromDate(new Date(2026, 7, 27, 13, 0))).toEqual({
      hour12: 1,
      minute: 0,
      meridiem: "PM",
    });
    expect(clockFieldsFromDate(new Date(2026, 7, 27, 12, 30))).toEqual({
      hour12: 12,
      minute: 30,
      meridiem: "PM",
    });
  });

  it("round-trips through to24Hour + combineDateAndTime", () => {
    const cases: [number, number, "AM" | "PM"][] = [
      [7, 0, "AM"],
      [12, 30, "PM"],
      [11, 45, "PM"],
      [12, 5, "AM"],
    ];
    for (const [hour12, minute, meridiem] of cases) {
      const { hours, minutes } = to24Hour(hour12, minute, meridiem);
      const iso = combineDateAndTime("2026-08-27", hours, minutes);
      expect(clockFieldsFromIso(iso)).toEqual({ hour12, minute, meridiem });
    }
  });
});

describe("formatClockTime", () => {
  it("formats a local timestamp as H:MM AM/PM", () => {
    expect(formatClockTime(new Date(2026, 2, 5, 7, 5).toISOString())).toBe("7:05 AM");
    expect(formatClockTime(new Date(2026, 2, 5, 13, 9).toISOString())).toBe("1:09 PM");
    expect(formatClockTime(new Date(2026, 2, 5, 23, 59).toISOString())).toBe("11:59 PM");
  });

  it("handles midnight and noon", () => {
    expect(formatClockTime(new Date(2026, 2, 5, 0, 0).toISOString())).toBe("12:00 AM");
    expect(formatClockTime(new Date(2026, 2, 5, 12, 30).toISOString())).toBe("12:30 PM");
  });

  it("does not zero-pad the hour but zero-pads the minute", () => {
    expect(formatClockTime(new Date(2026, 2, 5, 9, 3).toISOString())).toBe("9:03 AM");
  });
});

describe("localDateOf", () => {
  it("returns the local calendar day as YYYY-MM-DD", () => {
    expect(localDateOf(new Date(2026, 2, 5, 23, 30).toISOString())).toBe("2026-03-05");
    expect(localDateOf(new Date(2026, 2, 5, 0, 30).toISOString())).toBe("2026-03-05");
  });

  it("feeds formatLongDate", () => {
    const iso = new Date(2026, 7, 27, 8, 0).toISOString();
    expect(formatLongDate(localDateOf(iso))).toBe("27 - August - 2026");
  });
});

describe("combineDateAndTime", () => {
  it("produces a valid ISO-8601 timestamp", () => {
    expect(Number.isNaN(Date.parse(combineDateAndTime("2026-08-27", 7, 15)))).toBe(false);
  });
});

describe("entry ordering guard (FR-010)", () => {
  it("sorts createdAt timestamps for the same day chronologically via localeCompare", () => {
    const date = "2026-08-27";
    const morning = combineDateAndTime(date, 7, 0);
    const noon = combineDateAndTime(date, 12, 30);
    const evening = combineDateAndTime(date, 19, 45);

    const scrambled = [evening, morning, noon];
    const sorted = [...scrambled].sort((a, b) => a.localeCompare(b));

    expect(sorted).toEqual([morning, noon, evening]);
  });
});
