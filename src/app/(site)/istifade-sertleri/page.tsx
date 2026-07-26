import type { Metadata } from "next";

export const metadata: Metadata = { title: "İstifadə şərtləri" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <h1 className="display-font text-4xl">İstifadə şərtləri</h1>
      <div className="mt-8 space-y-4 text-sm text-[var(--fg-muted)]">
        <p>
          Saytdakı qiymətlər informativ xarakter daşıyır. Yekun şərtlər WhatsApp üzərindən
          təsdiqlənir. Depozit və icarə müddəti hər sifariş üçün ayrıca razılaşdırılır.
        </p>
        <p>
          Avadanlığın zədələnməsi və ya itirilməsi halında depozit və əlavə ödənişlər tətbiq
          oluna bilər. Gecikmə zamanı əlavə gün haqqı tutulur.
        </p>
      </div>
    </div>
  );
}
