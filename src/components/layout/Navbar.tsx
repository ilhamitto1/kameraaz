"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, MessageCircle, Home, Camera, Phone, Grid2x2 } from "lucide-react";
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
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50 });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const desktopMq = window.matchMedia("(min-width: 1024px)");

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        setCompact(y > 60);

        // Mobile: header always visible — hide/show causes scroll “jumps”
        if (!desktopMq.matches) {
          setHidden(false);
        } else if (y < 24) {
          setHidden(false);
        } else if (Math.abs(delta) > 4) {
          setHidden(delta > 0 && y > 80);
        }

        lastY = y;
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Force show while mega menu is open
  const navHidden = hidden && !open;

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

  // Top pill: catalog links only (Hamısı + kateqoriyalar). Əlaqə stays in menu/dock.
  const barItems = items.filter((item) => !item.href.startsWith("/elaqe"));

  function isItemActive(href: string) {
    if (href === "/avadanliqlar") {
      // Only the full catalog — not product detail pages under /avadanliqlar/[slug]
      return pathname === "/avadanliqlar";
    }
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
      {/* Top bar */}
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{
          y: navHidden ? "-110%" : 0,
          opacity: navHidden ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Mobile: full-width symmetrical header */}
        <div
          className="pointer-events-auto border-b border-white/[0.08] bg-[#050505]/80 backdrop-blur-xl lg:hidden"
          style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
        >
          <nav
            className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4"
            aria-label="Əsas naviqasiya"
          >
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#25D366] touch-manipulation active:bg-white/5"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>

            <button
              type="button"
              aria-label="Menyu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[var(--fg)] touch-manipulation active:bg-white/5"
            >
              {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </nav>
        </div>

        {/* Desktop: floating cinematic bar */}
        <div className="pointer-events-none hidden justify-center px-4 pt-5 lg:flex">
          <motion.nav
            data-cursor="focus"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setSpot({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            initial={false}
            animate={{ maxWidth: compact ? 860 : 1040 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="pointer-events-auto relative flex h-14 w-full items-center justify-between gap-2 overflow-hidden rounded-full border border-white/[0.08] bg-[#0c0c0e]/75 px-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl xl:px-4"
            style={{
              backgroundImage: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(200,255,0,0.07), transparent 40%)`,
            }}
          >
            <Link
              href="/"
              className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center"
              aria-label="kamera.agency"
            >
              <Image
                src="/brand/nav-k.png"
                alt=""
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
                priority
              />
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {barItems.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-cursor="focus"
                    className={cn(
                      "relative shrink-0 rounded-full px-2 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors xl:px-2.5 xl:text-[11px] xl:tracking-[0.14em]",
                      active
                        ? "text-[var(--fg)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg)]",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-0.5 h-px bg-[var(--accent)]" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-1.5">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="ask"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-2.5 text-[10px] uppercase tracking-wider text-[var(--fg-muted)] transition hover:border-[#25D366]/40 hover:text-[#25D366]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WA
              </a>
              <button
                type="button"
                data-cursor="focus"
                aria-label="Menyu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[var(--fg)] transition hover:border-white/25"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Fullscreen menu — thumb-friendly on mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="flex h-full flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))] sm:px-10"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="mono text-[10px] tracking-[0.3em] text-[var(--fg-muted)]">
                  VIEWFINDER // MENU
                </p>
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
                {items.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                      className="flex min-h-[52px] items-center gap-3 rounded-lg px-1 py-2 touch-manipulation active:bg-white/5"
                      data-cursor="view"
                    >
                      <span className="mono w-7 text-xs text-[var(--fg-muted)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "display-font text-[clamp(1.75rem,8vw,4.5rem)] leading-none transition-colors",
                          hoverIdx === i ? "text-[var(--accent)]" : "text-[var(--fg)]",
                        )}
                      >
                        {item.label}
                      </span>
                      {typeof item.count === "number" && (
                        <span className="mono ml-auto text-xs text-[var(--fg-muted)]">
                          {item.count}
                        </span>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom dock */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-label="Mobil naviqasiya"
      >
        <div className="mx-auto flex h-[3.75rem] max-w-lg items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/92 px-1.5 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {dock.slice(0, 2).map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl touch-manipulation transition",
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
            className="-mt-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[#052e16] shadow-[0_8px_24px_rgba(37,211,102,0.35)] touch-manipulation active:scale-95"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </a>

          {dock.slice(2).map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl touch-manipulation transition",
                  active ? "text-[var(--accent)]" : "text-[var(--fg-muted)]",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.75} />
                <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[var(--fg-muted)] touch-manipulation"
          >
            <Grid2x2 className="h-[18px] w-[18px]" />
            <span className="text-[9px] uppercase tracking-wider">Menyu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
