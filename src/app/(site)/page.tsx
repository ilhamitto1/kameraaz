import { getCachedFeaturedProducts, getCachedPublicCategories } from "@/lib/public-data";
import { getPublicSettings } from "@/actions/admin";
import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryOrbit } from "@/components/home/CategoryOrbit";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/utils";
import { BRAND_NAME, BRAND_OG_IMAGE } from "@/lib/brand";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Foto və Video Avadanlıq Kirayəsi Bakı",
  description: `${BRAND_NAME} — Bakıda peşəkar kamera, linza, işıq və stabilizator kirayəsi. WhatsApp ilə sürətli rezervasiya.`,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: `${BRAND_NAME} — Avadanlıq Kirayəsi`,
    description: "Peşəkar foto və video texnikası kirayəsi.",
    url: absoluteUrl("/"),
    siteName: BRAND_NAME,
    locale: "az_AZ",
    type: "website",
    images: [{ url: absoluteUrl(BRAND_OG_IMAGE), width: 1200, height: 1200, alt: BRAND_NAME }],
  },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const [featured, categories, settings] = await Promise.all([
    getCachedFeaturedProducts(6),
    getCachedPublicCategories(),
    getPublicSettings(),
  ]);

  const wa = getWhatsAppUrl(
    settings.whatsappNumber,
    "Salam. kamera.agency saytından yazıram. Avadanlıq rezervasiyası üçün əlaqə saxlayıram.",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "kamera.agency",
    url: getSiteUrl(),
    description: settings.seoDescription || settings.footerText,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phone,
      contactType: "customer service",
      areaServed: "AZ",
      availableLanguage: ["az"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero slogan={settings.heroSlogan} whatsappNumber={settings.whatsappNumber} />

      <FeaturedSection products={featured as never} />

      <CategoryOrbit categories={categories as never} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">Necə işləyir?</p>
        <h2 className="display-font mt-2 text-3xl sm:text-4xl lg:text-5xl">3 addım</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { t: "Avadanlığı seç", d: "Kataloqdan peşəkar texnika seç." },
            { t: "Qiymətə bax", d: "Günlük, həftəlik və ya aylıq tarif." },
            { t: "Rezerv et", d: "WhatsApp-da hazır mesaj göndər." },
          ].map((s, i) => (
            <div key={s.t} className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
              <p className="text-xs text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="display-font mt-3 text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-24">
        <div className="border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-12 sm:px-10 md:px-14">
          <h2 className="display-font text-3xl md:text-4xl">Çəkilişə hazırsan?</h2>
          <p className="mt-3 max-w-lg text-[var(--fg-muted)]">
            WhatsApp-dan yaz — mövcudluğu tez təsdiqləyək.
          </p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#25D366] px-6 text-sm font-semibold text-[#052e16] hover:brightness-110"
          >
            {settings.ctaText || "Rezerv et"}
          </a>
        </div>
      </section>
    </>
  );
}
