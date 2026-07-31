"use client";

import { useEffect, useMemo, useState } from "react";
import { RecIndicator, TimecodePrice, Textarea, Label, Input } from "@/components/ui/Form";
import { formatPrice, absoluteUrl } from "@/lib/utils";
import {
  buildWhatsAppMessage,
  getWhatsAppUrlForDevice,
} from "@/lib/whatsapp";
import { trackWhatsAppClick, incrementView } from "@/actions/products";
import { Share2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  longDesc?: string | null;
  dailyPrice?: number | null;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  deposit?: number | null;
  showDailyPrice?: boolean;
  showWeeklyPrice?: boolean;
  showMonthlyPrice?: boolean;
  status: string;
  mainImage?: string | null;
  includedItems?: string[];
  usageRules?: string | null;
  brand?: { name: string };
  category?: { name: string };
  images?: { url: string; alt?: string | null }[];
  specifications?: { label: string; value: string }[];
  bookingDates?: { startDate: string | Date; endDate: string | Date }[];
};

export function ProductDetailClient({
  product,
  settings,
  statusLabel,
}: {
  product: Product;
  settings: { whatsappNumber: string; whatsappTemplate: string };
  statusLabel: string;
}) {
  const images = useMemo(() => {
    const list = product.images?.length
      ? product.images.map((i) => i.url)
      : product.mainImage
        ? [product.mainImage]
        : [];
    return list;
  }, [product]);

  const [active, setActive] = useState(0);
  const [priceType, setPriceType] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    void incrementView(product.id);
  }, [product.id]);

  useEffect(() => {
    try {
      const key = "kz-recent";
      const prev = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      const next = [product.slug, ...prev.filter((s) => s !== product.slug)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [product.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") setActive((a) => (a + 1) % Math.max(images.length, 1));
      if (e.key === "ArrowLeft")
        setActive((a) => (a - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length]);

  const price =
    priceType === "WEEKLY"
      ? product.weeklyPrice
      : priceType === "MONTHLY"
        ? product.monthlyPrice
        : product.dailyPrice;

  const productUrl = absoluteUrl(`/avadanliqlar/${product.slug}`);

  const message = buildWhatsAppMessage({
    productName: product.name,
    price,
    priceType,
    productUrl,
    dates: startDate && endDate ? { startDate, endDate } : null,
    note,
    template: settings.whatsappTemplate,
  });

  const waUrl = getWhatsAppUrlForDevice(settings.whatsappNumber, message);

  function onWhatsApp() {
    void trackWhatsAppClick(product.id, priceType, "product-detail").catch(() => {});
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link kopyalandı");
    }
  }

  const reserveBtnClass =
    "flex h-12 w-full items-center justify-center rounded-md bg-[#25D366] text-base font-semibold text-[#052e16] shadow-[0_8px_24px_rgba(37,211,102,0.28)] touch-manipulation active:scale-[0.98] hover:brightness-110";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <button
          type="button"
          className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] touch-manipulation"
          onClick={() => images.length && setFullscreen(true)}
        >
          {images[active] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[active]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center display-font text-6xl text-white/10">
              {product.name.slice(0, 1)}
            </div>
          )}
        </button>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-16 w-16 shrink-0 border touch-manipulation ${
                  i === active ? "border-[var(--accent)]" : "border-[var(--border)]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)]">
              {product.brand?.name} · {product.category?.name}
            </p>
            <h1 className="display-font mt-2 text-3xl sm:text-4xl md:text-5xl">{product.name}</h1>
          </div>
          <button
            type="button"
            onClick={share}
            aria-label="Paylaş"
            className="border border-[var(--border)] p-2 touch-manipulation"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <RecIndicator status={product.status} label={statusLabel} />
        </div>

        <div className="mt-6 border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <TimecodePrice
            value={formatPrice(price).replace(" AZN", "")}
            suffix={
              priceType === "WEEKLY" ? "AZN / həftə" : priceType === "MONTHLY" ? "AZN / ay" : "AZN / gün"
            }
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {product.showDailyPrice !== false && product.dailyPrice != null && (
              <button
                type="button"
                onClick={() => setPriceType("DAILY")}
                className={`border px-3 py-1.5 text-xs touch-manipulation ${
                  priceType === "DAILY"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)]"
                }`}
              >
                Günlük {formatPrice(product.dailyPrice)}
              </button>
            )}
            {product.showWeeklyPrice && product.weeklyPrice != null && (
              <button
                type="button"
                onClick={() => setPriceType("WEEKLY")}
                className={`border px-3 py-1.5 text-xs touch-manipulation ${
                  priceType === "WEEKLY"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)]"
                }`}
              >
                Həftəlik {formatPrice(product.weeklyPrice)}
              </button>
            )}
            {product.showMonthlyPrice && product.monthlyPrice != null && (
              <button
                type="button"
                onClick={() => setPriceType("MONTHLY")}
                className={`border px-3 py-1.5 text-xs touch-manipulation ${
                  priceType === "MONTHLY"
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)]"
                }`}
              >
                Aylıq {formatPrice(product.monthlyPrice)}
              </button>
            )}
          </div>
          {product.deposit != null && (
            <p className="mt-3 text-sm text-[var(--fg-muted)]">
              Depozit: {formatPrice(product.deposit)}
            </p>
          )}
        </div>

        {product.shortDesc && (
          <p className="mt-6 text-[var(--fg-muted)]">{product.shortDesc}</p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Başlanğıc</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Son</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        {!!product.bookingDates?.length && (
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            Məşğul tarixlər:{" "}
            {product.bookingDates
              .map(
                (b) =>
                  `${new Date(b.startDate).toLocaleDateString("az-AZ")}–${new Date(b.endDate).toLocaleDateString("az-AZ")}`,
              )
              .join(", ")}
          </p>
        )}
        <div className="mt-4">
          <Label>Əlavə qeyd</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="İstəyə görə qeyd..." />
        </div>

        <div className="mt-6 hidden md:block">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsApp}
            className={reserveBtnClass}
          >
            Rezerv et
          </a>
        </div>

        {!!product.specifications?.length && (
          <div className="mt-10">
            <h2 className="display-font text-2xl">Texniki göstəricilər</h2>
            <dl className="mt-4 divide-y divide-[var(--border)] border border-[var(--border)]">
              {product.specifications.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-[var(--fg-muted)]">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {!!product.includedItems?.length && (
          <div className="mt-8">
            <h2 className="display-font text-2xl">Qutudan çıxanlar</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--fg-muted)]">
              {product.includedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {product.longDesc && (
          <div className="mt-8">
            <h2 className="display-font text-2xl">Təsvir</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--fg-muted)]">{product.longDesc}</p>
          </div>
        )}

        {product.usageRules && (
          <div className="mt-8">
            <h2 className="display-font text-2xl">İstifadə qaydaları</h2>
            <p className="mt-3 text-sm text-[var(--fg-muted)]">{product.usageRules}</p>
          </div>
        )}
      </div>

      {fullscreen && images[active] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setFullscreen(false)}
          role="dialog"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[active]} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
      )}

      <div
        className="fixed inset-x-0 z-[60] px-3 md:hidden"
        style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsApp}
          className={`${reserveBtnClass} rounded-xl`}
        >
          Rezerv et
        </a>
      </div>
    </div>
  );
}
