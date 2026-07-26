import { getFeaturedProducts } from "@/actions/products";
import { getCategories } from "@/actions/catalog";
import { getPublicSettings } from "@/actions/admin";
import { Hero } from "@/components/home/Hero";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryOrbit } from "@/components/home/CategoryOrbit";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories, settings] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(),
    getPublicSettings(),
  ]);

  const wa = getWhatsAppUrl(
    settings.whatsappNumber,
    "Salam. Çəkiliş tariximi planlaşdırmışam. Avadanlıq rezervasiyası üçün yazıram.",
  );

  return (
    <>
      <Hero slogan={settings.heroSlogan} whatsappNumber={settings.whatsappNumber} />

      <FeaturedSection products={featured as never} />

      <CategoryOrbit categories={categories as never} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-5 sm:py-24 md:px-8 md:py-28">
        <p className="mono text-xs text-[var(--accent)]">03 // WORKFLOW</p>
        <h2 className="display-font mt-2 text-4xl md:text-5xl">Necə işləyir?</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { t: "Avadanlığı seç", d: "Kataloqdan peşəkar texnika seç." },
            { t: "Qiymətə bax", d: "Günlük, həftəlik və ya aylıq tarifə bax." },
            { t: "WhatsApp-dan rezervasiya et", d: "Bir kliklə hazır mesaj göndər." },
          ].map((s, i) => (
            <div
              key={s.t}
              className="group relative overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] p-6 transition hover:border-[var(--accent)]/35"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-white/5 transition group-hover:scale-125" />
              <div className="mono text-[var(--accent)]">STEP {String(i + 1).padStart(2, "0")}</div>
              <div className="my-4 h-px w-full bg-[var(--border)]" />
              <h3 className="display-font text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-5 md:px-8 lg:pb-32">
        <div className="relative overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] px-8 py-16 md:px-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 animate-pulse rounded-full border border-[var(--accent)]/20" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.12),transparent_70%)]" />
          <h2 className="display-font relative text-3xl md:text-5xl">Çəkiliş tarixini planlaşdırmısan?</h2>
          <p className="relative mt-4 max-w-lg text-[var(--fg-muted)]">
            WhatsApp üzərindən birbaşa yaz — mövcudluğu dəqiqələrlə təsdiqləyək.
          </p>
          <a href={wa} target="_blank" rel="noopener noreferrer" data-cursor="ask" className="relative mt-8 inline-block">
            <Button variant="whatsapp" size="lg">
              {settings.ctaText || "WhatsApp ilə əlaqə"}
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}
