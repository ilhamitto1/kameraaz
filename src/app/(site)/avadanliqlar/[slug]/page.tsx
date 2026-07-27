import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductCard } from "@/components/products/ProductCard";
import type { CardProduct } from "@/components/products/ProductCard";
import {
  getCachedProductBySlug,
  getCachedRelatedByCategory,
} from "@/lib/public-data";
import { getPublicSettings } from "@/actions/admin";
import { absoluteUrl, formatPrice, getSiteUrl } from "@/lib/utils";
import { az } from "@/lib/i18n/az";
import { BRAND_NAME, BRAND_OG_IMAGE, brandify } from "@/lib/brand";

export const revalidate = 120;
// On-demand ISR only — avoid prerendering every product during `next build`
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) return { title: "Məhsul tapılmadı" };

  const name = String(product.name);
  const title = brandify(
    (product.seoTitle as string) || `${name} kirayə | ${BRAND_NAME}`,
  );
  const description = brandify(
    (product.seoDescription as string) ||
      (product.shortDesc as string) ||
      `${name} — günlük kirayə qiyməti ilə peşəkar avadanlıq.`,
  );
  const url = absoluteUrl(`/avadanliqlar/${slug}`);
  // WhatsApp preview: always hero brand logo (not product photo)
  const image = absoluteUrl(BRAND_OG_IMAGE);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 1200, alt: BRAND_NAME }],
      siteName: BRAND_NAME,
      locale: "az_AZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
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

  const curated = (product.relatedProducts as CardProduct[]) || [];
  const categorySlug = (product.category as { slug?: string } | null)?.slug;
  const related =
    curated.length > 0
      ? curated
      : categorySlug
        ? await getCachedRelatedByCategory(categorySlug, product.id as string, 4)
        : [];

  const accessories = (product.accessories as CardProduct[]) || [];

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
      seller: { "@type": "Organization", name: BRAND_NAME, url: getSiteUrl() },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(9.5rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-32">
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

      {accessories.length > 0 && (
        <section className="mt-24">
          <h2 className="display-font text-3xl">{az.products.accessories}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display-font text-3xl">{az.products.relatedProducts}</h2>
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
