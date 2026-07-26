"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Camera,
  Aperture,
  Lamp,
  Move3d,
  Box,
  Plus,
  Search,
  Package,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ProductAdminActions } from "@/components/admin/ProductAdminActions";

export type AdminProductCard = {
  id: string;
  name: string;
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  deposit: number | null;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  mainImage: string | null;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  brandName: string;
};

export type AdminCategoryTab = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  count: number;
};

const STATUS_AZ: Record<string, string> = {
  AVAILABLE: "Mövcuddur",
  RESERVED: "Rezerv",
  RENTED: "Kirayədə",
  SERVICE: "Servisdə",
  UNAVAILABLE: "Mövcud deyil",
};

function CategoryIcon({ icon, slug, className }: { icon?: string | null; slug: string; className?: string }) {
  const key = (icon || slug || "").toLowerCase();
  if (key.includes("camera") || key.includes("foto")) return <Camera className={className} />;
  if (key.includes("aperture") || key.includes("linza")) return <Aperture className={className} />;
  if (key.includes("lamp") || key.includes("isiq") || key.includes("işıq")) return <Lamp className={className} />;
  if (key.includes("move") || key.includes("stabil")) return <Move3d className={className} />;
  return <Box className={className} />;
}

export function ProductsAdmin({
  products,
  categories,
  initialCategoryId,
}: {
  products: AdminProductCard[];
  categories: AdminCategoryTab[];
  initialCategoryId?: string;
}) {
  const [active, setActive] = useState<string>(() => {
    if (initialCategoryId && categories.some((c) => c.id === initialCategoryId)) {
      return initialCategoryId;
    }
    return "all";
  });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (active !== "all" && p.categoryId !== active) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.brandName.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query)
      );
    });
  }, [products, active, q]);

  const activeCategory = categories.find((c) => c.id === active);
  const addHref =
    active !== "all"
      ? `/admin/mehsullar/yeni?category=${active}`
      : "/admin/mehsullar/yeni";
  const addLabel = activeCategory ? `${activeCategory.name} əlavə et` : "Yeni mal əlavə et";

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-muted)] sm:text-xs">
            Kataloq
          </p>
          <h1 className="display-font mt-1 text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">
            Kirayə malları
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--fg-muted)]">
            Kateqoriya seç, qiymət yaz, əlavə et.
          </p>
        </div>
        <Link
          href={addHref}
          className="hidden h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 text-sm font-semibold text-[#050505] transition hover:brightness-110 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Link>
      </div>

      {/* Category chips — edge-to-edge scroll on mobile */}
      <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2 pb-1">
          <button
            type="button"
            onClick={() => setActive("all")}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm touch-manipulation sm:px-4",
              active === "all"
                ? "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]"
                : "border-white/10 bg-white/[0.03] text-[var(--fg-muted)]",
            )}
          >
            <Package className="h-4 w-4" />
            Hamısı
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs">{products.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm touch-manipulation sm:px-4",
                active === c.id
                  ? "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "border-white/10 bg-white/[0.03] text-[var(--fg-muted)]",
              )}
            >
              <CategoryIcon icon={c.icon} slug={c.slug} className="h-4 w-4" />
              <span className="max-w-[9rem] truncate sm:max-w-none">{c.name}</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {active === "all" && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/mehsullar/yeni?category=${c.id}`}
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-3.5 touch-manipulation transition active:scale-[0.99] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 sm:p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[var(--fg-muted)] group-hover:text-[var(--accent)]">
                <CategoryIcon icon={c.icon} slug={c.slug} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-xs text-[var(--fg-muted)]">+ Tez əlavə et</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Axtar: Canon, linza..."
          className="h-12 w-full rounded-2xl border border-white/10 bg-[var(--bg-elevated)] pl-10 pr-4 text-base outline-none placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)]/50 sm:text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 px-4 py-12 text-center sm:px-6 sm:py-16">
          <p className="text-base font-medium sm:text-lg">Bu kateqoriyada mal yoxdur</p>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Ad və günlük qiymət kifayətdir.
          </p>
          <Link
            href={addHref}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#050505] touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            Əlavə et
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-elevated)] sm:rounded-3xl"
            >
              <Link href={`/admin/mehsullar/${p.id}`} className="block touch-manipulation">
                <div className="relative aspect-[16/10] bg-black/40">
                  {p.mainImage ? (
                    <Image
                      src={p.mainImage}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--fg-muted)]">
                      <Package className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute left-2.5 top-2.5 flex max-w-[90%] flex-wrap gap-1.5 sm:left-3 sm:top-3">
                    <span className="truncate rounded-full bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/90 backdrop-blur">
                      {p.categoryName}
                    </span>
                    {!p.isActive && (
                      <span className="rounded-full bg-red-500/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white">
                        Deaktiv
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 p-3.5 sm:p-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-medium sm:text-base">{p.name}</h2>
                    <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">
                      {p.brandName} · {STATUS_AZ[p.status] || p.status}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/25 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)]">
                      Günlük kirayə
                    </p>
                    <p className="display-font mt-0.5 text-xl text-[var(--accent)] sm:text-2xl">
                      {p.dailyPrice != null ? formatPrice(p.dailyPrice) : "—"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--fg-muted)]">
                      {p.weeklyPrice != null && <span>Həftə: {formatPrice(p.weeklyPrice)}</span>}
                      {p.monthlyPrice != null && <span>Ay: {formatPrice(p.monthlyPrice)}</span>}
                      {p.deposit != null && <span>Depozit: {formatPrice(p.deposit)}</span>}
                    </div>
                  </div>
                </div>
              </Link>
              <div className="border-t border-white/8 px-3 py-3 sm:px-4">
                <ProductAdminActions id={p.id} isFeatured={p.isFeatured} isActive={p.isActive} />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href={addHref}
        aria-label={addLabel}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-30 inline-flex h-14 items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[#050505] shadow-[0_8px_30px_rgba(0,0,0,0.45)] touch-manipulation sm:hidden"
      >
        <Plus className="h-5 w-5" />
        Əlavə et
      </Link>
    </div>
  );
}
