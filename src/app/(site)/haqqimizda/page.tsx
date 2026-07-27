import type { Metadata } from "next";

export const metadata: Metadata = { title: "Haqqımızda" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <p className="mono text-xs text-[var(--accent)]">ABOUT</p>
      <h1 className="display-font mt-2 text-5xl">Haqqımızda</h1>
      <div className="prose prose-invert mt-8 space-y-4 text-[var(--fg-muted)]">
        <p>
          kamera.agency Bakıda peşəkar foto və video çəkiliş avadanlıqlarının kirayəsi üçün
          yaradılmış premium kataloq platformasıdır.
        </p>
        <p>
          Biz e-commerce səbəti ilə deyil — birbaşa WhatsApp rezervasiya axını ilə işləyirik.
          Siz avadanlığı seçir, qiymətə baxır və bir kliklə bizimlə əlaqə saxlayırsınız.
        </p>
        <p>
          Katalogumuzda kameralar, linzalar, işıqlar, stabilizatorlar və aksesuarlar yer alır.
          Hər avadanlıq servisdən keçirilir və çəkilişə hazır saxlanılır.
        </p>
      </div>
    </div>
  );
}
