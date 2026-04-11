import { FastingLevel } from "../types";
import { daysFromEaster } from "./easter";
import { CALENDAR_2026 } from "../data/calendar2026";

const SCRAPED: Record<number, Record<string, FastingLevel>> = {
  2026: Object.fromEntries(
    Object.entries(CALENDAR_2026).map(([k, v]) => [k, v.fast])
  ),
};

/**
 * Computes the fasting level for a given date based on the
 * Macedonian Orthodox Church calendar rules.
 *
 * Fasting periods:
 *  - Great Lent: Clean Monday (Easter-48) through Holy Saturday (Easter-1)
 *  - Apostles' Fast: Monday after All Saints (Easter+57) through July 11
 *  - Dormition Fast: August 1–14
 *  - Nativity Fast: November 15 – January 6
 *  - Weekly fasts: Wednesday & Friday (except fast-free periods)
 *
 * Fast-free weeks (no Wed/Fri fast):
 *  - Christmastide: January 7–17
 *  - Meatfare/Cheesefare week (Бела седмица): Easter-55 to Easter-49
 *  - Bright Week: Easter+1 to Easter+7
 *  - Trinity/Pentecost week: Easter+50 to Easter+56
 */
export function computeFastingLevel(date: Date, easter: Date): FastingLevel {
  // Use real scraped data when available for the given year
  const yearData = SCRAPED[date.getFullYear()];
  if (yearData) {
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    const level = yearData[key];
    if (level !== undefined) return level;
  }

  const diff = daysFromEaster(date, easter);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const dow = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isWed = dow === 3;
  const isFri = dow === 5;
  const isSat = dow === 6;
  const isSun = dow === 0;

  // ─── FAST-FREE PERIODS ───────────────────────────────────────────────────────
  // Bright Week (Easter Sun through following Saturday): Easter+0 to Easter+7
  if (diff >= 0 && diff <= 7) return 0;
  // Trinity week (Pentecost Sun through following Saturday): Easter+49 to Easter+55
  if (diff >= 49 && diff <= 55) return 0;
  // Christmastide (Jan 7–17)
  if (month === 1 && day >= 7 && day <= 17) return 0;
  // Bela sedmitsa / Cheesefare week: Easter-55 to Easter-49 (Mon-Sun before Clean Monday)
  if (diff >= -55 && diff <= -49) return 0;

  // ─── MEATFARE WEEK (Месопусна седмица) ───────────────────────────────────────
  // The week Mon-Sat after Meatfare Sunday (Easter-63 to Easter-57), where no meat is eaten.
  // Wednesday and Friday of this week are Fish fasts; other days = no meat only.
  if (diff >= -62 && diff <= -56) {
    if (isWed || isFri) return 2; // fish fast on Wed/Fri
    return 1; // no meat other days
  }
  // Meatfare Sunday itself: last day to eat meat (feast, no fast)
  if (diff === -63) return 0;

  // ─── GREAT LENT ──────────────────────────────────────────────────────────────
  if (diff >= -48 && diff <= -1) {
    // Holy Saturday (Easter-1): strict (until Paschal Vigil)
    if (diff === -1) return 4;
    // Good Friday (Easter-2): strictest day of the year
    if (diff === -2) return 4;
    // Holy Thursday (Easter-3): oil & wine allowed (Liturgy day) → Level 3
    if (diff === -3) return 3;
    // Holy Wednesday (Easter-4): strict
    if (diff === -4) return 4;
    // Holy Monday (Easter-6), Holy Tuesday (Easter-5): strict
    if (diff === -5 || diff === -6) return 4;
    // Palm Sunday (Easter-7): fish allowed
    if (diff === -7) return 2;
    // Lazarus Saturday (Easter-8): fish + wine
    if (diff === -8) return 2;
    // Annunciation (March 25): fish allowed even in Lent
    if (month === 3 && day === 25) return 2;
    // First week of Lent Mon-Fri (Clean Monday to Friday): strict
    if (diff >= -48 && diff <= -44) return 4;
    // First week Saturday (Easter-43): oil + wine
    if (diff === -43) return 3;
    // Sundays of Lent (Easter-42, -35, -28, -21, -14): oil + wine allowed
    if (isSun) return 3;
    // Saturdays of Lent: oil + wine allowed
    if (isSat) return 3;
    // Regular Lenten weekdays: oil fast
    return 3;
  }

  // ─── APOSTLES' FAST ──────────────────────────────────────────────────────────
  // Starts Monday after All Saints (Easter+57), ends July 11
  const apostlesFastStart = 57; // days after Easter
  const isJuly11OrBefore = month < 7 || (month === 7 && day <= 11);
  const isAfterPentecostWeek = diff >= apostlesFastStart;
  if (isAfterPentecostWeek && isJuly11OrBefore && !(month === 7 && day > 11)) {
    if (isWed || isFri) return 2;
    return 3;
  }

  // ─── DORMITION FAST (August 1–14) ────────────────────────────────────────────
  if (month === 8 && day >= 1 && day <= 14) {
    if (isWed || isFri) return 2;
    return 3;
  }

  // ─── NATIVITY FAST (November 15 – January 6) ─────────────────────────────────
  const isNativityFast =
    (month === 11 && day >= 15) ||
    month === 12 ||
    (month === 1 && day <= 6);
  if (isNativityFast) {
    // Christmas Eve (Dec 24/Jan 4 old style) → in Macedonian church: Dec 24 is strict
    if (month === 12 && day === 24) return 4;
    // Theophany Eve (Jan 5): strict fast
    if (month === 1 && day === 5) return 4;
    // Dec 20 – Jan 4: no fish (oil fast only)
    const isStrictPeriod =
      (month === 12 && day >= 20) || (month === 1 && day <= 4);
    if (isStrictPeriod) {
      if (isWed || isFri) return 3; // oil fast on Wed/Fri (no fish in strict period)
      if (isSat || isSun) return 3;
      return 3;
    }
    // Nov 15 – Dec 19: fish allowed Mon/Tue/Thu/Sat
    if (isWed || isFri) return 2; // fish fast on Wed/Fri
    return 3; // oil fast other days
  }

  // ─── SPECIAL STRICT FAST DAYS (outside main fasts) ───────────────────────────
  // Exaltation of the Holy Cross (September 14)
  if (month === 9 && day === 14) return 4;
  // Beheading of St. John the Baptist (August 29)
  if (month === 8 && day === 29) return 4;
  // Theophany Eve (Jan 5) if somehow missed above
  if (month === 1 && day === 5) return 4;

  // ─── WEEKLY FASTS (Wed & Fri outside fasting periods) ────────────────────────
  if (isWed || isFri) return 2;

  // ─── NO FAST ─────────────────────────────────────────────────────────────────
  return 0;
}

/**
 * Returns a human-readable Macedonian label for the fasting level.
 */
export function getFastingLabel(level: FastingLevel): string {
  const labels: Record<FastingLevel, string> = {
    0: "Нема пост",
    1: "Без месо",
    2: "Пост на риба",
    3: "Пост на масло",
    4: "Строг пост",
  };
  return labels[level];
}
