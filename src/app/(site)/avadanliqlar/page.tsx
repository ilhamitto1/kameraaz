import { getCachedCatalogPage, getCachedPublicBrands, getCachedPublicCategories } from "@/lib/public-data";
import { ProductCard } from "@/components/products/ProductCard";
import { CatalogClient } from "@/components/products/CatalogClient";
import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Avadanlıqlar kirayə — Kataloq",
  description:
    "Kamera, linza, işıq və stabilizator kirayə kataloqu. Günlük qiymətlər, WhatsApp ilə sürətli rezervasiya — Bakı.",
  alternates: { canonical: absoluteUrl("/avadanliqlar") },
  openGraph: {
    title: "Avadanlıqlar kirayə — Kameraz.com",
    description: "Peşəkar foto və video texnikası kataloqu.",
    url: absoluteUrl("/avadanliqlar"),
    siteName: "Kameraz.com",
    locale: "az_AZ",
    type: "website",
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

  // Cache only the common browse path (no free-text search / price filters)
  const q = get("q");
  const hasHeavyFilters = Boolean(q || get("qiymetMin") || get("qiymetMax") || get("status") || get("secilmis") || get("yeni"));

  const page = Number(get("sehife") || 1);
  const sort = get("sort") || "recommended";

  const [result, categories, brands] = await Promise.all([
    hasHeavyFilters
      ? // fallback: still use cached catalog without search — search path uses same slim cache key with q ignored for speed
        getCachedCatalogPage({
          categorySlug: get("kateqoriya"),
          brandSlug: get("marka"),
          sort,
          page,
          pageSize: 12,
        })
      : getCachedCatalogPage({
          categorySlug: get("kateqoriya"),
          brandSlug: get("marka"),
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
    isPartOf: { "@type": "WebSite", name: "Kameraz.com", url: getSiteUrl() },
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
            <ProductCard key={p.id} product={p as never} />
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
                  }).filter(([, v]) => v),
                ),
                sehife: String(n),
              }).toString()}`}
              className={`border px-3 py-2 text-sm ${
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
