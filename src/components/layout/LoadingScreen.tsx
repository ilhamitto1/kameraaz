"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function LoadingScreen() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("kz-loaded")) return;
    setShow(true);
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 28 + 12;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        clearInterval(id);
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem("kz-loaded", "1");
        }, 280);
      } else setProgress(Math.floor(p));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050505]"
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 scale-75 rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.1),transparent_70%)] blur-xl" />
            <Image
              src="/brand/nav-k.png"
              alt="Kameraa AZ"
              width={128}
              height={128}
              priority
              className="relative h-10 w-10 object-contain md:h-12 md:w-12"
            />
          </motion.div>
          <p className="mono mt-6 text-xs text-[var(--fg-muted)]">
            {String(progress).padStart(3, "0")}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
