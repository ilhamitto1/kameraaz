import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/products/ProductCard";
import {
  getAllCategorySlugs,
  getCachedCategoryListing,
} from "@/lib/public-data";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const cats = await getAllCategorySlugs();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCachedCategoryListing(slug);
  if (!data) return { title: "Kateqoriya" };
  const { category } = data;
  const title = `${category.name} kirayə Bakı`;
  const description =
    category.description ||
    `${category.name} — peşəkar avadanlıq kirayəsi. Kameraz.com / kamera.agency`;
  const url = absoluteUrl(`/kateqoriya/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Kameraz.com",
      locale: "az_AZ",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCachedCategoryListing(slug);
  if (!data) notFound();

  const { category, products } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: absoluteUrl(`/kateqoriya/${slug}`),
    isPartOf: { "@type": "WebSite", name: "Kameraz.com", url: getSiteUrl() },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/avadanliqlar/${p.slug}`),
        name: p.name,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="mono text-xs text-[var(--accent)]">CATEGORY</p>
      <h1 className="display-font mt-2 text-4xl sm:text-5xl">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-[var(--fg-muted)]">{category.description}</p>
      <p className="mono mt-2 text-xs text-[var(--fg-muted)]">{category._count.products} məhsul</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p as never} />
        ))}
      </div>
    </div>
  );
}
