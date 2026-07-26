"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/products";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Form";

type Opt = { id: string; name: string };

export function ProductForm({
  categories,
  brands,
  initial,
}: {
  categories: Opt[];
  brands: Opt[];
  initial?: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState((initial?.name as string) || "");
  const [slug, setSlug] = useState((initial?.slug as string) || "");
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    (initial?.specifications as { label: string; value: string }[]) || [],
  );
  const [included, setIncluded] = useState(
    ((initial?.includedItems as string[]) || []).join("\n"),
  );
  const [mainImage, setMainImage] = useState((initial?.mainImage as string) || "");
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.success && json.data?.url) setMainImage(json.data.url);
    else setError(json.error || "Upload xətası");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      slug: String(fd.get("slug") || slugify(String(fd.get("name") || ""))),
      sku: String(fd.get("sku") || "") || null,
      shortDesc: String(fd.get("shortDesc") || "") || null,
      longDesc: String(fd.get("longDesc") || "") || null,
      dailyPrice: fd.get("dailyPrice") ? Number(fd.get("dailyPrice")) : null,
      weeklyPrice: fd.get("weeklyPrice") ? Number(fd.get("weeklyPrice")) : null,
      monthlyPrice: fd.get("monthlyPrice") ? Number(fd.get("monthlyPrice")) : null,
      deposit: fd.get("deposit") ? Number(fd.get("deposit")) : null,
      showDailyPrice: fd.get("showDailyPrice") === "on",
      showWeeklyPrice: fd.get("showWeeklyPrice") === "on",
      showMonthlyPrice: fd.get("showMonthlyPrice") === "on",
      mainImage: mainImage || null,
      status: String(fd.get("status") || "AVAILABLE"),
      badge: String(fd.get("badge") || "") || null,
      sortOrder: Number(fd.get("sortOrder") || 0),
      isFeatured: fd.get("isFeatured") === "on",
      isActive: fd.get("isActive") === "on",
      isNew: fd.get("isNew") === "on",
      includedItems: included
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      usageRules: String(fd.get("usageRules") || "") || null,
      seoTitle: String(fd.get("seoTitle") || "") || null,
      seoDescription: String(fd.get("seoDescription") || "") || null,
      categoryId: String(fd.get("categoryId") || ""),
      brandId: String(fd.get("brandId") || ""),
      images: mainImage ? [{ url: mainImage, alt: name, sortOrder: 0 }] : [],
      specifications: specs.filter((s) => s.label && s.value),
      accessoryIds: [],
      relatedProductIds: [],
    };

    start(async () => {
      const res = initial?.id
        ? await updateProduct(String(initial.id), payload)
        : await createProduct(payload);
      if (!res.success) {
        setError(res.error || "Xəta");
        return;
      }
      router.push("/admin/mehsullar");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Ad</Label>
          <Input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!initial) setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Kateqoriya</Label>
          <select
            name="categoryId"
            defaultValue={(initial?.categoryId as string) || categories[0]?.id}
            className="h-11 w-full border border-[var(--border)] bg-[var(--bg-panel)] px-3"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Marka</Label>
          <select
            name="brandId"
            defaultValue={(initial?.brandId as string) || brands[0]?.id}
            className="h-11 w-full border border-[var(--border)] bg-[var(--bg-panel)] px-3"
            required
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Qısa təsvir</Label>
        <Textarea name="shortDesc" defaultValue={(initial?.shortDesc as string) || ""} />
      </div>
      <div>
        <Label>Tam təsvir</Label>
        <Textarea name="longDesc" defaultValue={(initial?.longDesc as string) || ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label>Günlük</Label>
          <Input
            name="dailyPrice"
            type="number"
            step="0.01"
            defaultValue={(initial?.dailyPrice as number) ?? ""}
          />
        </div>
        <div>
          <Label>Həftəlik</Label>
          <Input
            name="weeklyPrice"
            type="number"
            step="0.01"
            defaultValue={(initial?.weeklyPrice as number) ?? ""}
          />
        </div>
        <div>
          <Label>Aylıq</Label>
          <Input
            name="monthlyPrice"
            type="number"
            step="0.01"
            defaultValue={(initial?.monthlyPrice as number) ?? ""}
          />
        </div>
        <div>
          <Label>Depozit</Label>
          <Input
            name="deposit"
            type="number"
            step="0.01"
            defaultValue={(initial?.deposit as number) ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input name="showDailyPrice" type="checkbox" defaultChecked={initial?.showDailyPrice !== false} />
          Günlük göstər
        </label>
        <label className="flex items-center gap-2">
          <input name="showWeeklyPrice" type="checkbox" defaultChecked={initial?.showWeeklyPrice !== false} />
          Həftəlik göstər
        </label>
        <label className="flex items-center gap-2">
          <input name="showMonthlyPrice" type="checkbox" defaultChecked={!!initial?.showMonthlyPrice} />
          Aylıq göstər
        </label>
        <label className="flex items-center gap-2">
          <input name="isFeatured" type="checkbox" defaultChecked={!!initial?.isFeatured} />
          Seçilmiş
        </label>
        <label className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked={initial?.isActive !== false} />
          Aktiv
        </label>
        <label className="flex items-center gap-2">
          <input name="isNew" type="checkbox" defaultChecked={!!initial?.isNew} />
          Yeni
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Status</Label>
          <select
            name="status"
            defaultValue={(initial?.status as string) || "AVAILABLE"}
            className="h-11 w-full border border-[var(--border)] bg-[var(--bg-panel)] px-3"
          >
            <option value="AVAILABLE">Mövcuddur</option>
            <option value="RESERVED">Rezerv</option>
            <option value="RENTED">Kirayədə</option>
            <option value="SERVICE">Servisdə</option>
            <option value="UNAVAILABLE">Mövcud deyil</option>
          </select>
        </div>
        <div>
          <Label>SKU</Label>
          <Input name="sku" defaultValue={(initial?.sku as string) || ""} />
        </div>
        <div>
          <Label>Sıra</Label>
          <Input name="sortOrder" type="number" defaultValue={(initial?.sortOrder as number) ?? 0} />
        </div>
      </div>

      <div>
        <Label>Əsas şəkil</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        {uploading && <p className="text-xs text-[var(--fg-muted)]">Yüklənir...</p>}
        {mainImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainImage} alt="" className="mt-2 h-32 object-cover" />
        )}
        <Input
          className="mt-2"
          placeholder="və ya URL"
          value={mainImage}
          onChange={(e) => setMainImage(e.target.value)}
        />
      </div>

      <div>
        <Label>Qutudan çıxanlar (hər sətir bir element)</Label>
        <Textarea value={included} onChange={(e) => setIncluded(e.target.value)} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Texniki göstəricilər</Label>
          <button
            type="button"
            className="text-xs text-[var(--accent)]"
            onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])}
          >
            + Sətir
          </button>
        </div>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                placeholder="Sensor"
                value={s.label}
                onChange={(e) =>
                  setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                }
              />
              <Input
                placeholder="Full Frame"
                value={s.value}
                onChange={(e) =>
                  setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                }
              />
              <button
                type="button"
                className="text-[var(--danger)]"
                onClick={() => setSpecs((arr) => arr.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>İstifadə qaydaları</Label>
        <Textarea name="usageRules" defaultValue={(initial?.usageRules as string) || ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>SEO title</Label>
          <Input name="seoTitle" defaultValue={(initial?.seoTitle as string) || ""} />
        </div>
        <div>
          <Label>SEO description</Label>
          <Input name="seoDescription" defaultValue={(initial?.seoDescription as string) || ""} />
        </div>
      </div>
      <div>
        <Label>Badge</Label>
        <Input name="badge" defaultValue={(initial?.badge as string) || ""} />
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saxlanılır..." : "Yadda saxla"}
      </Button>
    </form>
  );
}
