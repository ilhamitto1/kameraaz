"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

export function CatalogClient({
  categories,
  brands,
  initialQuery,
}: {
  categories: { slug: string; name: string }[];
  brands: { slug: string; name: string }[];
  initialQuery: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(initialQuery.q || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q === (initialQuery.q || "")) return;
      update({ q });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function update(patch: Record<string, string>) {
    const next = { ...initialQuery, ...patch };
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    start(() => router.push(`${pathname}?${params.toString()}`));
  }

  const selectClass =
    "h-11 w-full rounded-sm border border-[var(--border)] bg-[var(--bg-panel)] px-3 text-sm touch-manipulation";

  const filters = (
    <>
      <select
        className={selectClass}
        value={initialQuery.kateqoriya}
        onChange={(e) => update({ kateqoriya: e.target.value })}
      >
        <option value="">Kateqoriya</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={initialQuery.marka}
        onChange={(e) => update({ marka: e.target.value })}
      >
        <option value="">Marka</option>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={initialQuery.status}
        onChange={(e) => update({ status: e.target.value })}
      >
        <option value="">Mövcudluq</option>
        <option value="AVAILABLE">Mövcuddur</option>
        <option value="RESERVED">Rezerv</option>
        <option value="RENTED">Kirayədə</option>
        <option value="SERVICE">Servisdə</option>
        <option value="UNAVAILABLE">Mövcud deyil</option>
      </select>
      <select
        className={selectClass}
        value={initialQuery.sort}
        onChange={(e) => update({ sort: e.target.value })}
      >
        <option value="recommended">Tövsiyə</option>
        <option value="newest">Ən yeni</option>
        <option value="price-asc">Qiymət ↑</option>
        <option value="price-desc">Qiymət ↓</option>
        <option value="popular">Ən çox baxılan</option>
      </select>
      <label className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--fg-muted)]">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--accent)]"
          checked={initialQuery.secilmis === "1"}
          onChange={(e) => update({ secilmis: e.target.checked ? "1" : "" })}
        />
        Seçilmiş
      </label>
      <label className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--fg-muted)]">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--accent)]"
          checked={initialQuery.yeni === "1"}
          onChange={(e) => update({ yeni: e.target.checked ? "1" : "" })}
        />
        Yeni
      </label>
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          placeholder="Min AZN"
          value={initialQuery.qiymetMin}
          onChange={(e) => update({ qiymetMin: e.target.value })}
          className="h-11"
          aria-label="Minimum qiymət"
        />
        <Input
          type="number"
          min="0"
          placeholder="Max AZN"
          value={initialQuery.qiymetMax}
          onChange={(e) => update({ qiymetMax: e.target.value })}
          className="h-11"
          aria-label="Maksimum qiymət"
        />
      </div>
    </>
  );

  return (
    <div className={`mt-6 space-y-3 sm:mt-8 sm:space-y-4 ${pending ? "opacity-70" : ""}`}>
      <div className="flex gap-2">
        <Input
          placeholder="Axtarış..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Axtarış"
          className="h-11 flex-1"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 border border-[var(--border)] bg-[var(--bg-panel)] px-3 text-xs uppercase tracking-wider text-[var(--fg-muted)] touch-manipulation md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Desktop filters */}
      <div className="hidden flex-wrap gap-2 md:flex">{filters}</div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Bağla"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#121214] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Filtrlər</p>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 touch-manipulation"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3">{filters}</div>
            <Button className="mt-5 h-12 w-full" onClick={() => setFiltersOpen(false)}>
              Nəticələrə bax
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
