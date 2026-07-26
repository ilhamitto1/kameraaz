import { getProducts } from "@/actions/products";
import { getCategories, getBrands } from "@/actions/catalog";
import { ProductCard } from "@/components/products/ProductCard";
import { CatalogClient } from "@/components/products/CatalogClient";
import type { AvailabilityStatus } from "@prisma/client";
import { AvailabilityStatus as StatusEnum } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avadanlıqlar",
  description: "Kameraz.com peşəkar foto və video avadanlıq kataloqu",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const statusRaw = get("status");
  const status =
    statusRaw && (Object.values(StatusEnum) as string[]).includes(statusRaw)
      ? (statusRaw as AvailabilityStatus)
      : undefined;

  const page = Number(get("sehife") || 1);
  const [result, categories, brands] = await Promise.all([
    getProducts({
      categorySlug: get("kateqoriya"),
      brandSlug: get("marka"),
      status,
      isFeatured: get("secilmis") === "1" || undefined,
      isNew: get("yeni") === "1" || undefined,
      search: get("q"),
      minPrice: get("qiymetMin") ? Number(get("qiymetMin")) : undefined,
      maxPrice: get("qiymetMax") ? Number(get("qiymetMax")) : undefined,
      sort: get("sort") || "recommended",
      page,
      pageSize: 12,
    }),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <p className="mono text-xs text-[var(--accent)]">CATALOG // GEAR</p>
      <h1 className="display-font mt-2 text-3xl sm:text-4xl md:text-6xl">Avadanlıqlar</h1>

      <CatalogClient
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
        initialQuery={{
          kateqoriya: get("kateqoriya") || "",
          marka: get("marka") || "",
          q: get("q") || "",
          sort: get("sort") || "recommended",
          status: get("status") || "",
          secilmis: get("secilmis") || "",
          yeni: get("yeni") || "",
          qiymetMin: get("qiymetMin") || "",
          qiymetMax: get("qiymetMax") || "",
        }}
      />

      {result.items.length === 0 ? (
        <div className="mt-16 border border-[var(--border)] p-16 text-center">
          <p className="display-font text-3xl">Kadrda heç nə tapılmadı</p>
          <p className="mt-3 text-[var(--fg-muted)]">Filtrləri dəyişib yenidən yoxlayın.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((p) => (
            <ProductCard key={p.id as string} product={p as never} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`?${new URLSearchParams({
                ...Object.fromEntries(
                  Object.entries({
                    kateqoriya: get("kateqoriya"),
                    marka: get("marka"),
                    q: get("q"),
                    sort: get("sort"),
                    status: get("status"),
                  }).filter(([, v]) => v),
                ),
                sehife: String(n),
              }).toString()}`}
              className={`px-3 py-2 text-sm border ${
                n === result.page
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--fg-muted)]"
              }`}
            >
              {n}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
