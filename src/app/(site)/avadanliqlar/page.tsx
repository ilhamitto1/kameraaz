import { getCachedCatalogPage, getCachedPublicBrands, getCachedPublicCategories } from "@/lib/public-data";
import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/ProductCard";
import { CatalogClient } from "@/components/products/CatalogClient";
import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";
import { BRAND_MARK, BRAND_NAME } from "@/lib/brand";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Avadanlıqlar kirayə — Kataloq",
  description:
    "Kamera, linza, işıq və stabilizator kirayə kataloqu. Günlük qiymətlər, WhatsApp ilə sürətli rezervasiya — Bakı.",
  alternates: { canonical: absoluteUrl("/avadanliqlar") },
  openGraph: {
    title: `Avadanlıqlar kirayə — ${BRAND_NAME}`,
    description: "Peşəkar foto və video texnikası kataloqu.",
    url: absoluteUrl("/avadanliqlar"),
    siteName: BRAND_NAME,
    locale: "az_AZ",
    type: "website",
    images: [{ url: BRAND_MARK, width: 512, height: 512, alt: BRAND_NAME }],
  },
  robots: { index: true, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = get("q");
  const status = get("status");
  const hasHeavyFilters = Boolean(
    q || get("qiymetMin") || get("qiymetMax") || status || get("secilmis") || get("yeni"),
  );

  const page = Number(get("sehife") || 1);
  const sort = get("sort") || "recommended";
  const categorySlug = get("kateqoriya");
  const brandSlug = get("marka");

  const [result, categories, brands] = await Promise.all([
    hasHeavyFilters
      ? getProducts({
          categorySlug,
          brandSlug,
          search: q,
          status: status as never,
          isFeatured: get("secilmis") === "1" || undefined,
          isNew: get("yeni") === "1" || undefined,
          minPrice: get("qiymetMin") ? Number(get("qiymetMin")) : undefined,
          maxPrice: get("qiymetMax") ? Number(get("qiymetMax")) : undefined,
          sort,
          page,
          pageSize: 12,
        }).then((r) => ({
          items: r.items.map((p) => ({
            id: String(p.id),
            name: String(p.name),
            slug: String(p.slug),
            shortDesc: (p.shortDesc as string | null) ?? null,
            dailyPrice: (p.dailyPrice as number | null) ?? null,
            mainImage: (p.mainImage as string | null) ?? null,
            status: String(p.status),
            isFeatured: !!p.isFeatured,
            isNew: !!p.isNew,
            brand: p.brand ? { name: String((p.brand as { name: string }).name) } : null,
            category: p.category ? { name: String((p.category as { name: string }).name) } : null,
          })),
          total: r.total,
          page: r.page,
          pageSize: r.pageSize,
          totalPages: r.totalPages || 1,
        }))
      : getCachedCatalogPage({
          categorySlug,
          brandSlug,
          sort,
          page,
          pageSize: 12,
        }),
    getCachedPublicCategories(),
    getCachedPublicBrands(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Avadanlıqlar",
    url: absoluteUrl("/avadanliqlar"),
    isPartOf: { "@type": "WebSite", name: BRAND_NAME, url: getSiteUrl() },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((n) => {
            const params = new URLSearchParams();
            const keys = [
              "kateqoriya",
              "marka",
              "q",
              "sort",
              "status",
              "secilmis",
              "yeni",
              "qiymetMin",
              "qiymetMax",
            ] as const;
            for (const k of keys) {
              const v = get(k);
              if (v) params.set(k, v);
            }
            params.set("sehife", String(n));
            return (
              <a
                key={n}
                href={`?${params.toString()}`}
                className={`border px-3 py-2 text-sm ${
                  n === result.page
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--fg-muted)]"
                }`}
              >
                {n}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
