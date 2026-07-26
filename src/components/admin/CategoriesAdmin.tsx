"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/actions/catalog";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Form";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  isVisible: boolean;
  showInNav: boolean;
  _count: { products: number };
};

export function CategoriesAdmin({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<Cat | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [showInNav, setShowInNav] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  function reset() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setShowInNav(true);
    setIsVisible(true);
  }

  function save() {
    start(async () => {
      const payload = {
        name,
        slug: slug || slugify(name),
        description,
        sortOrder: editing?.sortOrder ?? initial.length,
        showInNav,
        isVisible,
        icon: editing?.icon || null,
        image: null,
      };
      if (editing) await updateCategory(editing.id, payload);
      else await createCategory(payload);
      reset();
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        {initial.map((c) => (
          <div key={c.id} className="flex items-center justify-between border border-[var(--border)] p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                /{c.slug} · {c._count.products} məhsul · nav:{c.showInNav ? "bəli" : "xeyr"}
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setEditing(c);
                  setName(c.name);
                  setSlug(c.slug);
                  setDescription(c.description || "");
                  setShowInNav(c.showInNav);
                  setIsVisible(c.isVisible);
                }}
              >
                Redaktə
              </button>
              <button
                type="button"
                className="text-[var(--danger)] underline"
                onClick={() => {
                  if (confirm("Silinsin?"))
                    start(async () => {
                      await deleteCategory(c.id);
                      router.refresh();
                    });
                }}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border border-[var(--border)] bg-[var(--bg-elevated)] p-5 space-y-4">
        <h2 className="display-font text-xl">{editing ? "Redaktə" : "Yeni kateqoriya"}</h2>
        <div>
          <Label>Ad</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!editing) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <Label>Təsvir</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showInNav} onChange={(e) => setShowInNav(e.target.checked)} />
          Navbar-da göstər
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />
          Görünən
        </label>
        <div className="flex gap-2">
          <Button type="button" onClick={save} disabled={pending || !name}>
            Saxla
          </Button>
          {editing && (
            <Button type="button" variant="ghost" onClick={reset}>
              Ləğv
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
