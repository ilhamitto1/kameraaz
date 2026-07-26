import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, incrementView, getProducts } from "@/actions/products";
import { getPublicSettings } from "@/actions/admin";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductCard } from "@/components/products/ProductCard";
import { absoluteUrl, formatPrice } from "@/lib/utils";
import { az } from "@/lib/i18n/az";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) as Record<string, unknown> | null;
  if (!product) return { title: "Məhsul tapılmadı" };
  const title = (product.seoTitle as string) || `${product.name as string} kirayə`;
  const description =
    (product.seoDescription as string) || (product.shortDesc as string) || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/avadanliqlar/${slug}`),
      images: product.mainImage ? [{ url: product.mainImage as string }] : undefined,
    },
    alternates: { canonical: absoluteUrl(`/avadanliqlar/${slug}`) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug) as Promise<Record<string, unknown> | null>,
    getPublicSettings(),
  ]);
  if (!product) notFound();

  await incrementView(product.id as string);

  const related = await getProducts({
    categorySlug: (product.category as { slug: string })?.slug,
    pageSize: 4,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    brand: (product.brand as { name: string })?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "AZN",
      price: product.dailyPrice,
      availability:
        product.status === "AVAILABLE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
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

      <section className="mt-24">
        <h2 className="display-font text-3xl">Əlaqəli məhsullar</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.items
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id as string} product={p as never} />
            ))}
        </div>
      </section>

      <p className="sr-only">
        Qiymət: {formatPrice(product.dailyPrice as number)}
      </p>
    </div>
  );
}
