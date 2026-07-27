import type { Metadata } from "next";
import { getPublicSettings } from "@/actions/admin";
import { ContactForm } from "@/components/contact/ContactForm";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Əlaqə",
  description: "kamera.agency ilə əlaqə — WhatsApp, telefon, email",
};

export default async function ContactPage() {
  const s = await getPublicSettings();
  const wa = getWhatsAppUrl(s.whatsappNumber, "Salam. kamera.agency əlaqə səhifəsindən yazıram.");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <p className="mono text-xs text-[var(--accent)]">CONTACT</p>
      <h1 className="display-font mt-2 text-5xl">Əlaqə</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="space-y-6 text-sm text-[var(--fg-muted)]">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--fg)]">Telefon</p>
            <p className="mt-1">{s.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--fg)]">Email</p>
            <p className="mt-1">{s.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--fg)]">Ünvan</p>
            <p className="mt-1">{s.address}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--fg)]">İş saatları</p>
            <p className="mt-1">{s.workingHours}</p>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" data-cursor="ask">
            <Button variant="whatsapp">WhatsApp</Button>
          </a>
          {s.mapsUrl && (
            <div className="mt-6 aspect-video overflow-hidden border border-[var(--border)]">
              <iframe
                title="Xəritə"
                src={
                  s.mapsUrl.includes("embed")
                    ? s.mapsUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`
                }
                className="h-full w-full grayscale"
                loading="lazy"
              />
            </div>
          )}
        </div>
        <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
          <h2 className="display-font text-2xl mb-6">Mesaj yazın</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
