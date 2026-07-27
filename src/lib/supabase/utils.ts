import { nanoid } from "nanoid";

export function newId() {
  return nanoid();
}

const PRICE_KEYS = new Set([
  "dailyPrice",
  "weeklyPrice",
  "monthlyPrice",
  "deposit",
]);

/** Deep-serialize Supabase rows (decimals as strings, dates) for Client Components. */
export function serializeRow<T>(row: T): T {
  return JSON.parse(
    JSON.stringify(row, (key, value) => {
      if (value !== null && typeof value === "object" && typeof (value as { toNumber?: unknown }).toNumber === "function") {
        return Number((value as { toNumber: () => number }).toNumber());
      }
      // PostgREST returns DECIMAL as string
      if (PRICE_KEYS.has(key) && typeof value === "string" && value !== "" && !Number.isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    }),
  ) as T;
}

export function nowIso() {
  return new Date().toISOString();
}
