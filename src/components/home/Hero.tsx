import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function Hero({
  slogan,
  whatsappNumber,
}: {
  slogan: string;
  whatsappNumber: string;
}) {
  const wa = getWhatsAppUrl(
    whatsappNumber,
    "Salam. kamera.agency saytından yazıram — çəkiliş avadanlığı haqqında soruşuram.",
  );

  return (
    <section className="relative flex min-h-[88svh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(200,255,0,0.07),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-28 pt-28 text-center sm:px-8 lg:items-start lg:pb-24 lg:pt-32 lg:text-left">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
          Bakı · Premium rental
        </p>

        <h1 className="sr-only">kamera.agency</h1>
        <Image
          src="/brand/logo-mark.png"
          alt="kamera.agency"
          width={416}
          height={236}
          priority
          className="mt-8 h-auto w-[120px] select-none sm:w-[160px] lg:w-[200px]"
        />

        <p className="mt-6 max-w-[28ch] text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg lg:max-w-md">
          {slogan}
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-md sm:flex-row lg:max-w-none">
          <Link
            href="/avadanliqlar"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-[var(--accent)] px-6 text-[15px] font-semibold text-[#050505] transition hover:brightness-110 touch-manipulation"
          >
            Avadanlıqlara bax
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md border border-[#25D366]/50 px-6 text-[15px] font-medium text-[#25D366] transition hover:bg-[#25D366]/10 touch-manipulation"
          >
            <MessageCircle className="h-4 w-4" />
            Rezerv et
          </a>
        </div>
      </div>
    </section>
  );
}
