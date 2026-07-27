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
  const [error, setError] = useState("");

  function reset() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setShowInNav(true);
    setIsVisible(true);
    setError("");
  }

  function save() {
    start(async () => {
      setError("");
      const payload = {
        name,
        slug: slug || slugify(name),
        description,
        sortOrder: editing?.sortOrder ?? initial.length,
        showInNav,
        isVisible,
        icon: editing?.icon || null,
        // image göndərmə — mövcud şəkil silinməsin
      };
      const res = editing
        ? await updateCategory(editing.id, payload)
        : await createCategory(payload);
      if (!res.success) {
        setError(res.error || "Saxlanılmadı");
        return;
      }
      reset();
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="order-2 space-y-3 lg:order-1">
        {initial.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{c.name}</p>
              <p className="truncate text-xs text-[var(--fg-muted)]">
                /{c.slug} · {c._count.products} məhsul · nav:{c.showInNav ? "bəli" : "xeyr"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                className="min-h-9 rounded-lg border border-white/10 px-3 touch-manipulation"
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
                className="min-h-9 rounded-lg border border-[var(--danger)]/30 px-3 text-[var(--danger)] touch-manipulation"
                onClick={() => {
                  if (confirm("Silinsin?"))
                    start(async () => {
                      const res = await deleteCategory(c.id);
                      if (!res.success) {
                        alert(res.error || "Silinmədi");
                        return;
                      }
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
      <div className="order-1 space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:p-5 lg:order-2">
        <h2 className="display-font text-xl">{editing ? "Redaktə" : "Yeni kateqoriya"}</h2>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
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
