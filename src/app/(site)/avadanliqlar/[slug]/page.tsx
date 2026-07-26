import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { incrementView } from "@/actions/products";
import { getPublicSettings } from "@/actions/admin";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductCard } from "@/components/products/ProductCard";
import {
  getAllProductSlugs,
  getCachedProductBySlug,
  getCachedRelatedByCategory,
} from "@/lib/public-data";
import { absoluteUrl, formatPrice, getSiteUrl } from "@/lib/utils";
import { az } from "@/lib/i18n/az";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const products = await getAllProductSlugs();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) return { title: "Məhsul tapılmadı" };

  const name = String(product.name);
  const title = (product.seoTitle as string) || `${name} kirayə Bakı`;
  const description =
    (product.seoDescription as string) ||
    (product.shortDesc as string) ||
    `${name} — günlük kirayə qiyməti ilə peşəkar avadanlıq.`;
  const url = absoluteUrl(`/avadanliqlar/${slug}`);
  const image = (product.mainImage as string) || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: image ? [{ url: image }] : undefined,
      siteName: "Kameraz.com",
      locale: "az_AZ",
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getCachedProductBySlug(slug),
    getPublicSettings(),
  ]);
  if (!product) notFound();

  void incrementView(product.id as string);

  const categorySlug = (product.category as { slug?: string } | null)?.slug;
  const related = categorySlug
    ? await getCachedRelatedByCategory(categorySlug, product.id as string, 4)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    image: product.mainImage || undefined,
    brand: {
      "@type": "Brand",
      name: (product.brand as { name?: string })?.name,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/avadanliqlar/${slug}`),
      priceCurrency: "AZN",
      price: product.dailyPrice,
      availability:
        product.status === "AVAILABLE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Kameraz.com", url: getSiteUrl() },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product as never}
        settings={{
          whatsappNumber: settings.whatsappNumber,
          whatsappTemplate: settings.whatsappTemplate,
        }}
        statusLabel={az.status[product.status as keyof typeof az.status] || String(product.status)}
      />

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display-font text-3xl">Əlaqəli məhsullar</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <p className="sr-only">Qiymət: {formatPrice(product.dailyPrice as number)}</p>
    </div>
  );
}
