"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { MobileGearCarousel } from "@/components/home/MobileGearCarousel";
import { cn } from "@/lib/utils";

const HeroCameras3D = dynamic(
  () => import("@/components/home/HeroCameras3D").then((m) => m.HeroCameras3D),
  { ssr: false },
);

export function Hero({
  slogan,
  whatsappNumber,
}: {
  slogan: string;
  whatsappNumber: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const rise = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const sceneX = useTransform(sx, (v) => v * 0.8);
  const sceneY = useTransform(sy, (v) => v * 0.6);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const wa = getWhatsAppUrl(
    whatsappNumber,
    "Salam. Kameraz.com — çəkiliş avadanlığı haqqında soruşuram.",
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-stretch overflow-hidden lg:items-center"
      onMouseMove={(e) => {
        if (!isDesktop) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 20);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 14);
      }}
    >
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,255,0,0.055),transparent_45%)] lg:bg-[radial-gradient(ellipse_at_70%_45%,rgba(200,255,0,0.08),transparent_55%)]" />

      {isDesktop && (
        <motion.div style={{ x: sceneX, y: sceneY }} className="absolute inset-0 z-[1] hidden lg:block">
          <HeroCameras3D />
        </motion.div>
      )}

      <div className="film-grain pointer-events-none absolute inset-0 z-[2] opacity-20 lg:opacity-40" />

      {/* Viewfinder — desktop only (less noise on mobile) */}
      <div className="pointer-events-none absolute inset-8 z-[4] hidden md:block">
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-white/20" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-white/20" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-white/20" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-white/20" />
      </div>

      <motion.div
        style={{ opacity: fade, y: rise }}
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-7xl flex-col",
          "px-5 pb-[7.25rem] pt-[5.75rem]",
          "sm:px-6 sm:pt-28",
          "md:px-8",
          "lg:min-h-[100svh] lg:flex-row lg:items-center lg:gap-10 lg:pb-24 lg:pt-24",
        )}
      >
        {/* Brand — centered on mobile, left on desktop */}
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center lg:mx-0 lg:w-[44%] lg:max-w-xl lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 lg:justify-start"
          >
            <span className="h-px w-5 bg-[var(--accent)]/80 lg:w-6" />
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--accent)]">
              Bakı · Premium rental
            </p>
            <span className="h-px w-5 bg-[var(--accent)]/80 lg:hidden" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-6 flex w-full justify-center sm:mt-8 lg:justify-start"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.16),transparent_70%)] blur-2xl sm:h-36 sm:w-36 lg:left-8 lg:translate-x-0"
            />
            <h1 className="sr-only">Kameraa AZ</h1>
            <Image
              src="/brand/hero-logo.png"
              alt="Kameraa AZ"
              width={520}
              height={160}
              priority
              className="relative mx-auto h-auto w-[200px] select-none sm:w-[260px] md:w-[300px] lg:mx-0 lg:w-[380px]"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
            className="mt-5 max-w-[22ch] text-[15px] leading-[1.55] text-[var(--fg-muted)] sm:mt-6 sm:max-w-[28ch] sm:text-base md:text-lg lg:max-w-md lg:text-left"
          >
            {slogan}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55 }}
            className="mt-7 flex w-full max-w-xs flex-col gap-2.5 sm:mt-8 sm:max-w-sm"
          >
            <Link href="/avadanliqlar" className="w-full">
              <Button
                data-cursor="view"
                size="lg"
                className="h-12 w-full rounded-md text-[15px] touch-manipulation"
              >
                Avadanlıqlara bax
              </Button>
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="ask"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#25D366]/45 bg-transparent text-[15px] font-medium text-[#25D366] transition active:bg-[#25D366]/10 touch-manipulation sm:hover:bg-[#25D366]/08"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp ilə əlaqə
            </a>
          </motion.div>
        </div>

        {/* Mobile: divider + gear gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="relative z-10 mt-10 w-full lg:hidden"
        >
          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <MobileGearCarousel />
        </motion.div>

        {/* Desktop caption */}
        <div className="relative mt-10 hidden flex-1 lg:mt-0 lg:block">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-8 right-0 max-w-[260px] border border-white/10 bg-black/55 p-4 backdrop-blur-md"
          >
            <p className="mono text-[9px] tracking-[0.28em] text-[var(--accent)]">GEAR ORBIT // LIVE</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">
              Mirrorless · Cinema · Linza · Gimbal · İşıq
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <motion.span
          animate={{ y: [0, 6, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="h-8 w-px bg-gradient-to-b from-[var(--accent)] to-transparent"
        />
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/35">Scroll</span>
      </div>
    </section>
  );
}
