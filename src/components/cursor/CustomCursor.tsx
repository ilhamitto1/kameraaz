"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CursorMode = "default" | "view" | "ask" | "zoom" | "focus" | "drag";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [enabled, setEnabled] = useState(false);
  const [clicking, setClicking] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      const next = (el?.dataset.cursor as CursorMode) || "default";
      setMode(next);
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.18;
      ring.current.y += (pos.current.y - ring.current.y) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!enabled) return null;

  const label =
    mode === "view"
      ? "Bax"
      : mode === "ask"
        ? "Soruş"
        : mode === "zoom"
          ? "Zoom"
          : mode === "drag"
            ? "Drag"
            : null;

  return (
    <>
      <div
        ref={dotRef}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform",
          clicking && "scale-150",
        )}
      >
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-[var(--accent)] transition-transform",
            clicking && "scale-[2] bg-white",
          )}
        />
      </div>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent)]/50 transition-all duration-200",
            mode === "focus" && "h-12 w-12 border-[var(--accent)]",
            mode === "ask" && "h-14 w-14 border-[#25D366]",
            clicking && "scale-75 opacity-40",
          )}
        >
          {label && (
            <span className="text-[9px] uppercase tracking-widest text-[var(--fg)] mono">{label}</span>
          )}
        </div>
      </div>
    </>
  );
}
