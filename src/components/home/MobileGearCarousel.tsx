"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const GEAR = [
  { src: "/brand/gear/gear-camera.png", label: "Mirrorless", meta: "Body" },
  { src: "/brand/gear/gear-cinema.png", label: "Cinema", meta: "Camera" },
  { src: "/brand/gear/gear-lens.png", label: "Linza", meta: "Optic" },
  { src: "/brand/gear/gear-gimbal.png", label: "Gimbal", meta: "Stabilizer" },
  { src: "/brand/gear/gear-light.png", label: "İşıq", meta: "Lighting" },
];

export function MobileGearCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.querySelector("[data-gear-card]") as HTMLElement | null;
      if (!card) return;
      const gap = 12;
      const idx = Math.round(el.scrollLeft / (card.offsetWidth + gap));
      setActive(Math.max(0, Math.min(GEAR.length - 1, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full lg:hidden">
      <div className="mb-4 flex flex-col items-center text-center">
        <p className="mono text-[10px] tracking-[0.22em] text-[var(--fg-muted)]">SEÇİLMİŞ AVADANLIQ</p>
        <p className="mt-1 text-sm text-[var(--fg)]">Kataloqdan nümunələr</p>
        <p className="mono mt-2 text-[10px] tabular-nums text-[var(--fg-muted)]">
          {String(active + 1).padStart(2, "0")}
          <span className="text-white/25"> / {String(GEAR.length).padStart(2, "0")}</span>
        </p>
      </div>

      {/* Full-bleed rail aligned to page gutters */}
      <div className="-mx-5 sm:-mx-6">
        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {GEAR.map((g, i) => (
            <motion.article
              key={g.src}
              data-gear-card
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.45 }}
              className="w-[148px] shrink-0 snap-start"
            >
              <div className="relative overflow-hidden rounded-[10px] bg-[#0e0e10] ring-1 ring-white/[0.08]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.src}
                  alt={g.label}
                  className="aspect-[4/5] w-full object-cover"
                  draggable={false}
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
              <div className="mt-2.5 px-0.5 text-center">
                <p className="text-[13px] font-medium leading-none tracking-wide text-[var(--fg)]">
                  {g.label}
                </p>
                <p className="mono mt-1 text-[10px] tracking-[0.14em] text-[var(--fg-muted)]">
                  {g.meta}
                </p>
              </div>
            </motion.article>
          ))}
          {/* End spacer so last card can snap cleanly */}
          <div className="w-2 shrink-0" aria-hidden />
        </div>
      </div>

      {/* Progress dots */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {GEAR.map((g, i) => (
          <span
            key={g.src}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === active ? "w-4 bg-[var(--accent)]" : "w-1 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
