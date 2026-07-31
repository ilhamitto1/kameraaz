"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, Home, Camera, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export type NavItem = { label: string; href: string; count?: number };

export function Navbar({
  items,
  whatsappNumber,
}: {
  items: NavItem[];
  whatsappNumber: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const wa = getWhatsAppUrl(whatsappNumber, "Salam. kamera.agency saytından yazıram.");
  const barItems = items.filter((item) => !item.href.startsWith("/elaqe"));

  function isItemActive(href: string) {
    if (href === "/avadanliqlar") return pathname === "/avadanliqlar";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const dock = [
    { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    {
      href: "/avadanliqlar",
      label: "Kataloq",
      icon: Camera,
      match: (p: string) => p.startsWith("/avadanliqlar") || p.startsWith("/kateqoriya"),
    },
    { href: "/elaqe", label: "Əlaqə", icon: Phone, match: (p: string) => p.startsWith("/elaqe") },
  ];

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
      >
        <nav
          className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
          aria-label="Əsas naviqasiya"
        >
          <Link href="/" className="flex shrink-0 items-center" aria-label="kamera.agency">
            <Image
              src="/brand/nav-k.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
            {barItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors",
                    active
                      ? "text-[var(--fg)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="mt-1 block h-px w-full bg-[var(--accent)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#25D366]/35 px-3 text-xs font-medium text-[#25D366] touch-manipulation hover:bg-[#25D366]/10"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <button
              type="button"
              aria-label="Menyu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 touch-manipulation md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/95 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex h-full flex-col px-5 pt-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))]"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--fg-muted)]">Menyu</p>
              <button
                type="button"
                aria-label="Bağla"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 touch-manipulation"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[52px] items-center justify-between rounded-lg px-1 py-2 touch-manipulation active:bg-white/5"
                  >
                    <span className="display-font text-3xl">{item.label}</span>
                    {typeof item.count === "number" && (
                      <span className="text-xs text-[var(--fg-muted)]">{item.count}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-[#052e16] touch-manipulation"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
        aria-label="Mobil naviqasiya"
      >
        <div className="mx-auto flex h-14 max-w-lg items-center justify-around rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/95 px-2 backdrop-blur-xl">
          {dock.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl touch-manipulation",
                  active ? "text-[var(--accent)]" : "text-[var(--fg-muted)]",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[#25D366] touch-manipulation"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="text-[9px] uppercase tracking-wider">WA</span>
          </a>
        </div>
      </nav>
    </>
  );
}
