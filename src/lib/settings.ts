import { getAdminClient } from "@/lib/supabase/admin";
import { nowIso } from "@/lib/supabase/utils";
import type { SettingsShape } from "@/types";

function settingRowId(key: string) {
  return `set_${key}`;
}

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

export async function getSetting<K extends keyof SettingsShape>(key: K): Promise<SettingsShape[K]> {
  const settings = await getSettings();
  return settings[key];
}

export async function getSettings(): Promise<SettingsShape> {
  if (isCacheValid()) {
    return { ...DEFAULT_SETTINGS, ...cache } as SettingsShape;
  }

  const sb = getAdminClient();
  const { data: rows } = await sb.from("SiteSetting").select("key, value");
  const fromDb: Partial<SettingsShape> = {};

  for (const row of rows || []) {
    const key = row.key as keyof SettingsShape;
    if (key in DEFAULT_SETTINGS) {
      (fromDb as Record<string, unknown>)[key] = row.value as SettingValue;
    }
  }

  cache = fromDb;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;

  return { ...DEFAULT_SETTINGS, ...fromDb };
}

export async function updateSetting<K extends keyof SettingsShape>(
  key: K,
  value: SettingsShape[K],
): Promise<void> {
  const sb = getAdminClient();
  const { error } = await sb.from("SiteSetting").upsert(
    {
      id: settingRowId(String(key)),
      key,
      value: value as never,
      updatedAt: nowIso(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
  invalidateSettingsCache();
}

export async function updateSettings(partial: Partial<SettingsShape>): Promise<void> {
  const sb = getAdminClient();
  const entries = Object.entries(partial) as [keyof SettingsShape, SettingValue][];
  if (!entries.length) return;

  const { error } = await sb.from("SiteSetting").upsert(
    entries.map(([key, value]) => ({
      id: settingRowId(String(key)),
      key,
      value: value as never,
      updatedAt: nowIso(),
    })),
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
  invalidateSettingsCache();
}

export function invalidateSettingsCache(): void {
  cache = null;
  cacheExpiresAt = 0;
}
