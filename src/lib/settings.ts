import { prisma } from "@/lib/prisma";
import type { SettingsShape } from "@/types";

export const DEFAULT_SETTINGS: SettingsShape = {
  siteName: "Kameraz.com",
  whatsappNumber: "+994501234567",
  whatsappTemplate:
    "Salam. Kameraz.com saytında {name} modelinə baxdım. Qiyməti: {price}. Kirayə şərtləri barədə məlumat almaq istəyirəm. Link: {url}",
  phone: "+994501234567",
  email: "info@kameraz.com",
  address: "Bakı, Azərbaycan",
  workingHours: "Hər gün 09:00 - 21:00",
  instagram: "https://instagram.com/kameraz.az",
  tiktok: "https://tiktok.com/@kameraz.az",
  youtube: "https://youtube.com/@kameraz.az",
  footerText: "Kameraz.com — Bakıda peşəkar foto və video texnikasının kirayəsi.",
  heroTitle: "Peşəkar kamera texnikası kirayəsi",
  heroSlogan: "Çəkilişə hazır avadanlıq. Sən yalnız ideyanı gətir.",
  heroImage: "",
  ctaText: "WhatsApp ilə əlaqə",
  seoTitle: "Kameraz.com — Foto və Video Avadanlıq Kirayəsi Bakı",
  seoDescription:
    "Bakıda peşəkar kamera, linza, işıq və stabilizator kirayəsi. WhatsApp ilə sürətli rezervasiya.",
  mapsUrl: "https://maps.google.com/?q=Baku",
  announcementBar: "",
  maintenanceMode: false,
  logo: "",
  favicon: "",
};

type SettingValue = SettingsShape[keyof SettingsShape];

let cache: Partial<SettingsShape> | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

function isCacheValid(): boolean {
  return cache !== null && Date.now() < cacheExpiresAt;
}

/** Fetch a single setting value by key, falling back to the default if unset. */
export async function getSetting<K extends keyof SettingsShape>(
  key: K,
): Promise<SettingsShape[K]> {
  const settings = await getSettings();
  return settings[key];
}

/** Fetch all settings merged with defaults (missing DB rows fall back to defaults). */
export async function getSettings(): Promise<SettingsShape> {
  if (isCacheValid()) {
    return { ...DEFAULT_SETTINGS, ...cache } as SettingsShape;
  }

  const rows = await prisma.siteSetting.findMany();
  const fromDb: Partial<SettingsShape> = {};

  for (const row of rows) {
    const key = row.key as keyof SettingsShape;
    if (key in DEFAULT_SETTINGS) {
      (fromDb as Record<string, unknown>)[key] = row.value as SettingValue;
    }
  }

  cache = fromDb;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;

  return { ...DEFAULT_SETTINGS, ...fromDb };
}

/** Upsert a single setting value and invalidate the in-memory cache. */
export async function updateSetting<K extends keyof SettingsShape>(
  key: K,
  value: SettingsShape[K],
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as never },
    update: { value: value as never },
  });
  invalidateSettingsCache();
}

/** Upsert many settings at once (e.g. from a settings form submit). */
export async function updateSettings(partial: Partial<SettingsShape>): Promise<void> {
  const entries = Object.entries(partial) as [keyof SettingsShape, SettingValue][];
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: value as never },
        update: { value: value as never },
      }),
    ),
  );
  invalidateSettingsCache();
}

export function invalidateSettingsCache(): void {
  cache = null;
  cacheExpiresAt = 0;
}
