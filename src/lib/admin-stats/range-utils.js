import {
  subDays,
  startOfDay,
  startOfMonth,
  subMonths,
  endOfMonth,
  format,
  differenceInDays,
} from "date-fns";
import { tr } from "date-fns/locale";

const RANGES = ["7d", "30d", "1y"];

/**
 * @param {string} range - "7d" | "30d" | "1y"
 * @returns {{ startDate: Date, endDate: Date, previousStart: Date, previousEnd: Date, bucketCount: number, bucketType: string }}
 */
export function getRangeMeta(range) {
  const r = RANGES.includes(range) ? range : "30d";
  const now = new Date();
  const endDate = startOfDay(now);

  if (r === "7d") {
    const startDate = startOfDay(subDays(now, 6));
    const previousEnd = startOfDay(subDays(now, 7));
    const previousStart = startOfDay(subDays(now, 13));
    return {
      startDate,
      endDate,
      previousStart,
      previousEnd,
      bucketCount: 7,
      bucketType: "day",
    };
  }

  if (r === "30d") {
    const startDate = startOfDay(subDays(now, 29));
    const previousEnd = startOfDay(subDays(now, 30));
    const previousStart = startOfDay(subDays(now, 59));
    return {
      startDate,
      endDate,
      previousStart,
      previousEnd,
      bucketCount: 30,
      bucketType: "day",
    };
  }

  // 1y: son 12 ay
  const startDate = startOfMonth(subMonths(now, 11));
  const previousEnd = startOfMonth(subMonths(now, 12));
  const previousStart = startOfMonth(subMonths(now, 23));
  return {
    startDate,
    endDate,
    previousStart,
    previousEnd,
    bucketCount: 12,
    bucketType: "month",
  };
}

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

/**
 * @param {string} range - "7d" | "30d" | "1y"
 * @returns {{ key: string, name: string, start: Date, end: Date }[]}
 */
export function buildSeriesBuckets(range) {
  const r = RANGES.includes(range) ? range : "30d";
  const now = new Date();
  const buckets = [];

  if (r === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const start = startOfDay(d);
      const end = startOfDay(subDays(now, i - 1));
      buckets.push({
        key: format(d, "yyyy-MM-dd"),
        name: DAY_NAMES[d.getDay()],
        start,
        end: i === 0 ? new Date() : end,
      });
    }
    return buckets;
  }

  if (r === "30d") {
    for (let i = 29; i >= 0; i--) {
      const d = subDays(now, i);
      const start = startOfDay(d);
      const next = subDays(now, i - 1);
      buckets.push({
        key: format(d, "yyyy-MM-dd"),
        name: format(d, "d MMM", { locale: tr }),
        start,
        end: i === 0 ? new Date() : startOfDay(next),
      });
    }
    return buckets;
  }

  // 1y: 12 ay
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = i === 0 ? new Date() : endOfMonth(d);
    buckets.push({
      key: format(start, "yyyy-MM"),
      name: monthNames[start.getMonth()],
      start,
      end,
    });
  }
  return buckets;
}

export { differenceInDays };
