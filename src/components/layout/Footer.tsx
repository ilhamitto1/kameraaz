"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function Footer({
  slogan,
  whatsappNumber,
  phone,
  email,
  address,
  footerText,
  categories,
}: {
  slogan: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  footerText: string;
  categories: { name: string; slug: string }[];
}) {
  const [tc, setTc] = useState("00:00:00:00");

  useEffect(() => {
    const tick = () => {
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Baku" }),
      );
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      const f = String(Math.floor((now.getMilliseconds() / 1000) * 24)).padStart(2, "0");
      setTc(`${h}:${m}:${s}:${f}`);
    };
    tick();
    const id = setInterval(tick, 40);
    return () => clearInterval(id);
  }, []);

  const wa = getWhatsAppUrl(whatsappNumber, "Salam. Kameraz.com — rezervasiya üçün yazıram.");

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-elevated)] pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:mt-24 lg:pb-10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hero-logo.png"
            alt="Kameraa AZ"
            className="h-12 w-auto max-w-[200px] object-contain opacity-90"
          />
          <p className="mt-3 max-w-sm text-sm text-[var(--fg-muted)]">{slogan}</p>
          <p className="mono mt-6 text-xs text-[var(--accent)]">BAKU TC // {tc}</p>
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
            data-cursor="ask"
            className="mt-5 inline-flex rounded-sm bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#052e16]"
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
        © {new Date().getFullYear()} Kameraz.com — {footerText}
      </div>
    </footer>
  );
}
