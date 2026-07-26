import { formatPrice } from "@/lib/utils";
import type { WhatsAppMessageOptions } from "@/types";

export const DEFAULT_WHATSAPP_TEMPLATE =
  "Salam. Kameraz.com saytında {name} modelinə baxdım. Qiyməti: {price}. Kirayə şərtləri barədə məlumat almaq istəyirəm. Link: {url}";

const PRICE_TYPE_LABELS_AZ: Record<string, string> = {
  DAILY: "günlük",
  WEEKLY: "həftəlik",
  MONTHLY: "aylıq",
};

function formatDateAz(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Builds the final WhatsApp message text by filling in a template (default or custom,
 * e.g. from site settings) with product details. Supported placeholders:
 * {name}, {price}, {priceType}, {url}, {dates}, {note}
 */
export function buildWhatsAppMessage(options: WhatsAppMessageOptions): string {
  const {
    productName,
    price,
    priceType,
    productUrl,
    dates,
    note,
    template = DEFAULT_WHATSAPP_TEMPLATE,
  } = options;

  const priceLabel =
    price === null || price === undefined || price === ""
      ? "sorğu üzrə"
      : formatPrice(price);

  const priceTypeLabel = priceType ? (PRICE_TYPE_LABELS_AZ[priceType] ?? priceType) : "";

  let datesLabel = "";
  if (dates?.startDate && dates?.endDate) {
    datesLabel = `${formatDateAz(dates.startDate)} - ${formatDateAz(dates.endDate)}`;
  }

  let message = template
    .replaceAll("{name}", productName)
    .replaceAll("{price}", priceTypeLabel ? `${priceLabel} (${priceTypeLabel})` : priceLabel)
    .replaceAll("{priceType}", priceTypeLabel)
    .replaceAll("{url}", productUrl)
    .replaceAll("{dates}", datesLabel)
    .replaceAll("{note}", note ?? "");

  if (!template.includes("{dates}") && datesLabel) {
    message += `\nTarixlər: ${datesLabel}`;
  }
  if (!template.includes("{note}") && note) {
    message += `\nQeyd: ${note}`;
  }

  return message;
}

/** Strip everything except digits and a leading `+` from a phone number. */
export function normalizePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^0-9]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Builds a wa.me deep link for the given phone number and message.
 * wa.me links work uniformly across desktop (WhatsApp Web) and mobile
 * (WhatsApp app) — WhatsApp itself decides how to open the link.
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const digitsOnly = normalizePhoneNumber(phone).replace(/^\+/, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
}

/**
 * Client-side helper: detects whether the current device is mobile so callers
 * can decide between `wa.me` (mobile, opens app) and `web.whatsapp.com` (desktop).
 * Safe to call on the server too — returns `false` when `navigator` is unavailable.
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

/**
 * Client-side helper: returns the most appropriate WhatsApp URL for the current
 * device — `wa.me` on mobile, `web.whatsapp.com` on desktop.
 */
export function getWhatsAppUrlForDevice(phone: string, message: string): string {
  const digitsOnly = normalizePhoneNumber(phone).replace(/^\+/, "");
  const encodedMessage = encodeURIComponent(message);

  if (isMobileDevice()) {
    return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
  }

  return `https://web.whatsapp.com/send?phone=${digitsOnly}&text=${encodedMessage}`;
}
