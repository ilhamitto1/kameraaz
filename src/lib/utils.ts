import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(value: number | string | null | undefined, currency = "AZN"): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return `${num.toLocaleString("az-AZ", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function normalizeSiteOrigin(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value)) return undefined;
  try {
    const url = new URL(value);
    // Ignore placeholder URLs from early templates
    if (url.hostname === "senin-layihe.vercel.app") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const raw of candidates) {
    const origin = normalizeSiteOrigin(raw);
    if (origin) return origin;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
