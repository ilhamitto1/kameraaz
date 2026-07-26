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

  return (
    <div className={`flex flex-wrap gap-1 text-xs ${pending ? "opacity-50" : ""}`}>
      <button type="button" className="underline" onClick={() => run(() => toggleFeatured(id))}>
        {isFeatured ? "Unfeature" : "Feature"}
      </button>
      <button type="button" className="underline" onClick={() => run(() => toggleActive(id))}>
        {isActive ? "Deaktiv" : "Aktiv"}
      </button>
      <button type="button" className="underline" onClick={() => run(() => duplicateProduct(id))}>
        Kopiya
      </button>
      <button type="button" className="underline" onClick={() => run(() => archiveProduct(id))}>
        Arxiv
      </button>
      <button
        type="button"
        className="text-[var(--danger)] underline"
        onClick={() => {
          if (confirm("Məhsulu silmək istəyirsiniz?")) run(() => deleteProduct(id));
        }}
      >
        Sil
      </button>
    </div>
  );
}
