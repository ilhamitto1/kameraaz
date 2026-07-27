import type { Metadata } from "next";

export const metadata: Metadata = { title: "Məxfilik siyasəti" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <h1 className="display-font text-4xl">Məxfilik siyasəti</h1>
      <div className="mt-8 space-y-4 text-sm text-[var(--fg-muted)]">
        <p>
          kamera.agency olaraq əlaqə forması və WhatsApp vasitəsilə əldə etdiyimiz şəxsi
          məlumatları yalnız rezervasiya və müştəri xidməti məqsədilə istifadə edirik.
        </p>
        <p>
          Məlumatlar üçüncü tərəflərə satılmır. Texniki loglar təhlükəsizlik və analitika
          üçün məhdud müddətə saxlanıla bilər.
        </p>
        <p>Suallarınız üçün: info@kamera.agency</p>
      </div>
    </div>
  );
}
