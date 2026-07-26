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
    <div className="grid gap-8 lg:grid-cols-2">
      <ul className="space-y-2">
        {initial.map((b) => (
          <li key={b.id} className="flex items-center justify-between border border-[var(--border)] p-4">
            <div>
              <p>{b.name}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {b.slug} · {b._count.products} məhsul
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className="underline"
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
                className="text-[var(--danger)] underline"
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
      <div className="border border-[var(--border)] p-5 space-y-4">
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
