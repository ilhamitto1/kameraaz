/** Canonical public brand — use everywhere (UI, OG, WhatsApp metadata). */
export const BRAND_NAME = "kamera.agency";
export const BRAND_NAME_DISPLAY = "KAMERA.AGENCY";
export const BRAND_EMAIL = "info@kamera.agency";

/** Square mark — best for WhatsApp / OG / favicon */
export const BRAND_MARK = "/brand/logo-mark.png";
/** Full wordmark fallback when no custom logo is set in admin */
export const BRAND_LOGO = "/brand/logo-mark.png";

/** Rewrite legacy Kameraz / Kameraa strings to kamera.agency */
export function brandify(text: string): string {
  return text
    .replace(/Kameraz\.com/gi, BRAND_NAME)
    .replace(/info@kameraz\.com/gi, BRAND_EMAIL)
    .replace(/Kameraa[_\s-]?AZ/gi, BRAND_NAME)
    .replace(/KAMERAA[_\s-]?AZ/g, BRAND_NAME_DISPLAY)
    .replace(/Kameraz/gi, BRAND_NAME)
    .replace(/KAMERAZ/g, BRAND_NAME_DISPLAY);
}
