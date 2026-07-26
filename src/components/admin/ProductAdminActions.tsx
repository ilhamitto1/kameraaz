"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  toggleFeatured,
  toggleActive,
  duplicateProduct,
  archiveProduct,
} from "@/actions/products";

export function ProductAdminActions({
  id,
  isFeatured,
  isActive,
}: {
  id: string;
  isFeatured: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  const btn =
    "inline-flex min-h-9 items-center rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-[var(--fg-muted)] touch-manipulation active:bg-white/5 sm:text-xs";

  return (
    <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${pending ? "pointer-events-none opacity-50" : ""}`}>
      <button type="button" className={btn} onClick={() => run(() => toggleFeatured(id))}>
        {isFeatured ? "Seçilmişdən çıxar" : "Seçilmiş"}
      </button>
      <button type="button" className={btn} onClick={() => run(() => toggleActive(id))}>
        {isActive ? "Gizlət" : "Göstər"}
      </button>
      <button type="button" className={btn} onClick={() => run(() => duplicateProduct(id))}>
        Kopyala
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => {
          if (confirm("Arxivləmək istəyirsiniz?")) run(() => archiveProduct(id));
        }}
      >
        Arxiv
      </button>
      <button
        type="button"
        className={`${btn} border-[var(--danger)]/30 text-[var(--danger)]`}
        onClick={() => {
          if (confirm("Malı silmək istəyirsiniz? Bu əməliyyat geri qaytarılmır.")) {
            run(() => deleteProduct(id));
          }
        }}
      >
        Sil
      </button>
    </div>
  );
}
