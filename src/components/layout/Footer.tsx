import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function Footer({
  slogan,
  whatsappNumber,
  phone,
  email,
  address,
  footerText,
  logo,
  instagram,
  tiktok,
  youtube,
  categories,
}: {
  slogan: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  footerText: string;
  logo?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  categories: { name: string; slug: string }[];
}) {
  const wa = getWhatsAppUrl(whatsappNumber, "Salam. kamera.agency — rezervasiya üçün yazıram.");
  const socials = [
    { label: "Instagram", href: instagram },
    { label: "TikTok", href: tiktok },
    { label: "YouTube", href: youtube },
  ].filter((s) => s.href?.trim());

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-elevated)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:mt-20 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo?.trim() || "/brand/logo-mark.png"}
            alt="kamera.agency"
            className="h-10 w-auto max-w-[120px] object-contain opacity-90"
          />
          <p className="mt-3 max-w-sm text-sm text-[var(--fg-muted)]">{slogan}</p>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-wider text-[var(--fg-muted)]">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)]">Kateqoriyalar</p>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/kateqoriya/${c.slug}`} className="hover:text-[var(--accent)]">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)]">Əlaqə</p>
          <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
            <li>{phone}</li>
            <li>{email}</li>
            <li>{address}</li>
          </ul>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#052e16]"
          >
            WhatsApp
          </a>
        </div>

        <div className="md:col-span-2">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)]">Hüquqi</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/mexfilik-siyaseti">Məxfilik</Link>
            </li>
            <li>
              <Link href="/istifade-sertleri">Şərtlər</Link>
            </li>
            <li>
              <Link href="/haqqimizda">Haqqımızda</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-5 py-5 text-center text-xs text-[var(--fg-muted)] md:px-8">
        © {new Date().getFullYear()} kamera.agency — {footerText}
      </div>
    </footer>
  );
}
