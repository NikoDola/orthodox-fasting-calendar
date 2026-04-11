/**
 * Computes Orthodox (Julian) Easter for a given year,
 * then converts the Julian date to Gregorian (+13 days for 1900–2099).
 */
export function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;

  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;

  const month = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April
  const day = ((d + e + 114) % 31) + 1;

  // Convert Julian → Gregorian (+13 days for 1900–2099)
  return new Date(year, month - 1, day + 13);
}

/**
 * Returns a Date offset by `days` from the given date.
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Difference in whole days between two dates (b - a).
 */
export function daysDiff(a: Date, b: Date): number {
  const msA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const msB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((msB - msA) / 86400000);
}

/**
 * Returns number of days from Easter to the given date
 * (negative = before Easter, 0 = Easter, positive = after Easter).
 */
export function daysFromEaster(date: Date, easter: Date): number {
  return daysDiff(easter, date);
}
