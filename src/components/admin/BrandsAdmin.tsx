"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrand, updateBrand, deleteBrand } from "@/actions/catalog";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

type Brand = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { products: number };
};

export function BrandsAdmin({ initial }: { initial: Brand[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <ul className="order-2 space-y-2 lg:order-1">
        {initial.map((b) => (
          <li
            key={b.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{b.name}</p>
              <p className="truncate text-xs text-[var(--fg-muted)]">
                {b.slug} · {b._count.products} məhsul
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                className="min-h-9 rounded-lg border border-white/10 px-3 touch-manipulation"
                onClick={() =>
                  start(async () => {
                    await updateBrand(b.id, { isActive: !b.isActive });
                    router.refresh();
                  })
                }
              >
                {b.isActive ? "Deaktiv" : "Aktiv"}
              </button>
              <button
                type="button"
                className="min-h-9 rounded-lg border border-[var(--danger)]/30 px-3 text-[var(--danger)] touch-manipulation"
                onClick={() => {
                  if (confirm("Silinsin?"))
                    start(async () => {
                      await deleteBrand(b.id);
                      router.refresh();
                    });
                }}
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="order-1 space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:p-5 lg:order-2">
        <h2 className="display-font text-xl">Yeni marka</h2>
        <div>
          <Label>Ad</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <Button
          type="button"
          disabled={pending || !name}
          onClick={() =>
            start(async () => {
              await createBrand({ name, slug, isActive: true, logo: null });
              setName("");
              setSlug("");
              router.refresh();
            })
          }
        >
          Əlavə et
        </Button>
      </div>
    </div>
  );
}
