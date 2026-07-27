"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ImagePlus, Check } from "lucide-react";
import { createProduct, updateProduct } from "@/actions/products";
import { slugify, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Form";

type Opt = { id: string; name: string };

function PriceField({
  name,
  label,
  hint,
  defaultValue,
  required,
  autoFocus,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: number | null;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <Label className="mb-1 text-[10px]">{label}</Label>
      {hint && <p className="mb-2 text-[11px] text-[var(--fg-muted)]">{hint}</p>}
      <div className="relative">
        <Input
          name={name}
          type="number"
          step="0.01"
          min="0"
          required={required}
          autoFocus={autoFocus}
          defaultValue={defaultValue ?? ""}
          placeholder="0"
          className="h-14 rounded-xl pr-14 text-xl font-semibold tracking-tight sm:pr-16 sm:text-2xl"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--fg-muted)]">
          AZN
        </span>
      </div>
    </div>
  );
}

type PickerOpt = { id: string; name: string; categoryName: string };

function ProductRelationsPicker({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string;
  hint: string;
  options: PickerOpt[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.categoryName.toLowerCase().includes(query),
    );
  }, [options, q]);

  return (
    <div>
      <Label>{label}</Label>
      <p className="mb-2 text-[11px] text-[var(--fg-muted)]">{hint}</p>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Axtar..."
        className="mb-2 h-10 rounded-xl"
      />
      <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-xs text-[var(--fg-muted)]">Mal tapılmadı</p>
        ) : (
          filtered.map((o) => {
            const checked = selected.includes(o.id);
            return (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(checked ? selected.filter((id) => id !== o.id) : [...selected, o.id])
                  }
                />
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="shrink-0 text-[10px] text-[var(--fg-muted)]">{o.categoryName}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ProductForm({
  categories,
  brands,
  allProducts = [],
  initial,
  defaultCategoryId,
}: {
  categories: Opt[];
  brands: Opt[];
  allProducts?: PickerOpt[];
  initial?: Record<string, unknown> | null;
  defaultCategoryId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState((initial?.name as string) || "");
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(
    (initial?.specifications as { label: string; value: string }[]) || [],
  );
  const [included, setIncluded] = useState(
    ((initial?.includedItems as string[]) || []).join("\n"),
  );
  const [mainImage, setMainImage] = useState((initial?.mainImage as string) || "");
  const [uploading, setUploading] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(
    (initial?.categoryId as string) || defaultCategoryId || categories[0]?.id || "",
  );
  const [accessoryIds, setAccessoryIds] = useState<string[]>(
    ((initial?.accessories as { accessoryId: string }[]) || []).map((a) => a.accessoryId),
  );
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    ((initial?.relatedFrom as { relatedProductId: string }[]) || []).map((r) => r.relatedProductId),
  );

  const pickerOptions = useMemo(
    () => allProducts.filter((p) => p.id !== initial?.id),
    [allProducts, initial?.id],
  );

  const categoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name || "Mal",
    [categories, categoryId],
  );

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.success && json.data?.url) setMainImage(json.data.url);
    else setError(json.error || "Şəkil yüklənmədi");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const dailyRaw = fd.get("dailyPrice");
    const dailyPrice = dailyRaw === "" || dailyRaw == null ? null : Number(dailyRaw);

    if (!name.trim()) {
      setError("Malın adını yaz");
      return;
    }
    if (dailyPrice == null || Number.isNaN(dailyPrice)) {
      setError("Günlük kirayə qiymətini yaz (AZN)");
      return;
    }
    if (!categoryId) {
      setError("Kateqoriya seç");
      return;
    }
    const brandId = String(fd.get("brandId") || "");
    if (!brandId) {
      setError("Marka seç");
      return;
    }

    const weeklyRaw = fd.get("weeklyPrice");
    const monthlyRaw = fd.get("monthlyPrice");
    const depositRaw = fd.get("deposit");

    const payload = {
      name: name.trim(),
      slug: slugify(name.trim()) || `mal-${Date.now()}`,
      sku: String(fd.get("sku") || "") || null,
      shortDesc: String(fd.get("shortDesc") || "") || null,
      longDesc: String(fd.get("longDesc") || "") || null,
      dailyPrice,
      weeklyPrice: weeklyRaw === "" || weeklyRaw == null ? null : Number(weeklyRaw),
      monthlyPrice: monthlyRaw === "" || monthlyRaw == null ? null : Number(monthlyRaw),
      deposit: depositRaw === "" || depositRaw == null ? null : Number(depositRaw),
      showDailyPrice: true,
      showWeeklyPrice: weeklyRaw !== "" && weeklyRaw != null,
      showMonthlyPrice: monthlyRaw !== "" && monthlyRaw != null,
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
      categoryId,
      brandId,
      images: (() => {
        const prev =
          (initial?.images as { url: string; alt?: string | null; sortOrder?: number }[]) || [];
        if (!mainImage) {
          return prev.map((img, i) => ({
            url: img.url,
            alt: img.alt || name.trim(),
            sortOrder: i,
          }));
        }
        if (prev.length) {
          const rest = prev.filter(
            (img) => img.url !== mainImage && img.url !== (initial?.mainImage as string),
          );
          return [
            { url: mainImage, alt: name.trim(), sortOrder: 0 },
            ...rest.map((img, i) => ({
              url: img.url,
              alt: img.alt || name.trim(),
              sortOrder: i + 1,
            })),
          ];
        }
        return [{ url: mainImage, alt: name.trim(), sortOrder: 0 }];
      })(),
      specifications: specs.filter((s) => s.label && s.value),
      accessoryIds,
      relatedProductIds,
    };

    // Keep existing slug on edit
    if (initial?.slug) {
      payload.slug = String(initial.slug);
    }

    start(async () => {
      const res = initial?.id
        ? await updateProduct(String(initial.id), payload)
        : await createProduct(payload);
      if (!res.success) {
        const fieldMsg =
          res.fieldErrors &&
          Object.values(res.fieldErrors)
            .flat()
            .filter(Boolean)[0];
        setError(fieldMsg || res.error || "Saxlanılmadı. Yenidən yoxla.");
        return;
      }
      router.push(`/admin/mehsullar?category=${categoryId}`);
      router.refresh();
    });
  }

  if (!categories.length || !brands.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center">
        <p className="text-lg font-medium">Əvvəlcə kateqoriya və marka lazımdır</p>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Mal əlavə etməzdən əvvəl ən azı 1 kateqoriya və 1 marka yarat.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/admin/kateqoriyalar" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#050505]">
            Kateqoriyalar
          </a>
          <a href="/admin/markalar" className="rounded-xl border border-white/15 px-4 py-2 text-sm">
            Markalar
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-5">
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:rounded-3xl sm:p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">1 · Nə əlavə edirsən?</p>
        <h2 className="mt-1 text-xl font-medium">{categoryName}</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Kateqoriya</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-[var(--bg-panel)] px-3 text-sm outline-none focus:border-[var(--accent)]"
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
              className="h-12 w-full rounded-xl border border-white/10 bg-[var(--bg-panel)] px-3 text-sm outline-none focus:border-[var(--accent)]"
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

        <div className="mt-4">
          <Label>Malın adı</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="məs. Canon EOS R5"
            className="h-12 rounded-xl text-base"
            required
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-4 sm:rounded-3xl sm:p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">2 · Kirayə qiymətləri</p>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Əsas olan günlük qiymətdir. Digərləri istəyə bağlıdır.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <PriceField
            name="dailyPrice"
            label="Günlük qiymət *"
            hint="Müştəri ilk bunu görür"
            defaultValue={initial?.dailyPrice as number | null}
            required
            autoFocus={!initial}
          />
          <PriceField
            name="weeklyPrice"
            label="Həftəlik qiymət"
            hint="Boş buraxmaq olar"
            defaultValue={initial?.weeklyPrice as number | null}
          />
          <PriceField
            name="monthlyPrice"
            label="Aylıq qiymət"
            defaultValue={initial?.monthlyPrice as number | null}
          />
          <PriceField
            name="deposit"
            label="Depozit"
            hint="Girov məbləği"
            defaultValue={initial?.deposit as number | null}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:rounded-3xl sm:p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">3 · Şəkil</p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-8 transition hover:border-[var(--accent)]/40">
          {mainImage ? (
            <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl">
              <Image src={mainImage} alt="" fill className="object-cover" sizes="320px" unoptimized />
            </div>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-[var(--fg-muted)]" />
              <p className="mt-3 text-sm font-medium">Şəkil yüklə</p>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">Telefon və ya kompüterdən</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
        {uploading && <p className="mt-2 text-xs text-[var(--fg-muted)]">Yüklənir...</p>}
        {mainImage && (
          <button
            type="button"
            className="mt-3 text-xs text-[var(--danger)]"
            onClick={() => setMainImage("")}
          >
            Şəkli sil
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:rounded-3xl sm:p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">4 · Status</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Hazırkı vəziyyət</Label>
            <select
              name="status"
              defaultValue={(initial?.status as string) || "AVAILABLE"}
              className="h-12 w-full rounded-xl border border-white/10 bg-[var(--bg-panel)] px-3 text-sm"
            >
              <option value="AVAILABLE">Mövcuddur — kirayəyə verilir</option>
              <option value="RESERVED">Rezerv olunub</option>
              <option value="RENTED">Hal-hazırda kirayədə</option>
              <option value="SERVICE">Servisdə / təmirdə</option>
              <option value="UNAVAILABLE">Müvəqqəti yoxdur</option>
            </select>
          </div>
          <div className="flex flex-col justify-end gap-3 pb-1 text-sm">
            <label className="flex items-center gap-2">
              <input name="isActive" type="checkbox" defaultChecked={initial?.isActive !== false} />
              Saytda görünsün
            </label>
            <label className="flex items-center gap-2">
              <input name="isFeatured" type="checkbox" defaultChecked={!!initial?.isFeatured} />
              Ana səhifədə seçilmiş
            </label>
            <label className="flex items-center gap-2">
              <input name="isNew" type="checkbox" defaultChecked={!!initial?.isNew} />
              “Yeni” nişanı
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--bg-elevated)]">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left md:px-6"
        >
          <div>
            <p className="text-sm font-medium">Əlavə məlumat (istəyə bağlı)</p>
            <p className="text-xs text-[var(--fg-muted)]">Təsvir, qutu içindəkilər, texniki detallar</p>
          </div>
          <ChevronDown className={cn("h-5 w-5 transition", moreOpen && "rotate-180")} />
        </button>
        {moreOpen && (
          <div className="space-y-4 border-t border-white/10 px-5 py-5 md:px-6">
            <div>
              <Label>Qısa təsvir</Label>
              <Textarea
                name="shortDesc"
                defaultValue={(initial?.shortDesc as string) || ""}
                placeholder="1-2 cümlə"
                className="min-h-20 rounded-xl"
              />
            </div>
            <div>
              <Label>Tam təsvir</Label>
              <Textarea
                name="longDesc"
                defaultValue={(initial?.longDesc as string) || ""}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Qutudan çıxanlar (hər sətir = 1 şey)</Label>
              <Textarea
                value={included}
                onChange={(e) => setIncluded(e.target.value)}
                placeholder={"Batareya\nŞarj cihazı\nÇanta"}
                className="rounded-xl"
              />
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
                      className="rounded-xl"
                      onChange={(e) =>
                        setSpecs((arr) =>
                          arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="Full Frame"
                      value={s.value}
                      className="rounded-xl"
                      onChange={(e) =>
                        setSpecs((arr) =>
                          arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="px-2 text-[var(--danger)]"
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
              <Textarea
                name="usageRules"
                defaultValue={(initial?.usageRules as string) || ""}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>SKU (istəyə bağlı)</Label>
                <Input name="sku" defaultValue={(initial?.sku as string) || ""} className="rounded-xl" />
              </div>
              <div>
                <Label>Sıra nömrəsi</Label>
                <Input
                  name="sortOrder"
                  type="number"
                  defaultValue={(initial?.sortOrder as number) ?? 0}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label>Badge mətni</Label>
              <Input
                name="badge"
                defaultValue={(initial?.badge as string) || ""}
                placeholder="məs. Populyar"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>SEO başlıq</Label>
                <Input
                  name="seoTitle"
                  defaultValue={(initial?.seoTitle as string) || ""}
                  placeholder="Google üçün başlıq"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label>SEO təsvir</Label>
                <Input
                  name="seoDescription"
                  defaultValue={(initial?.seoDescription as string) || ""}
                  placeholder="Qısa meta təsvir"
                  className="rounded-xl"
                />
              </div>
            </div>
            {pickerOptions.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ProductRelationsPicker
                  label="Uyğun aksesuarlar"
                  hint="Məhsul səhifəsində göstəriləcək"
                  options={pickerOptions}
                  selected={accessoryIds}
                  onChange={setAccessoryIds}
                />
                <ProductRelationsPicker
                  label="Bənzər məhsullar"
                  hint="Seçilməsə, eyni kateqoriyadan göstərilir"
                  options={pickerOptions}
                  selected={relatedProductIds}
                  onChange={setRelatedProductIds}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <div
        className="sticky bottom-2 z-10 -mx-1 flex gap-2 rounded-2xl border border-white/10 bg-[#0c0c0e]/95 p-2.5 backdrop-blur-xl sm:bottom-4 sm:mx-0 sm:gap-3 sm:p-3"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Button
          type="button"
          variant="secondary"
          className="min-h-12 flex-1 rounded-xl text-sm touch-manipulation"
          onClick={() => router.push("/admin/mehsullar")}
        >
          Ləğv
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="min-h-12 flex-[1.6] rounded-xl text-sm touch-manipulation sm:flex-[1.4]"
        >
          <Check className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {pending ? "Saxlanılır..." : initial?.id ? "Saxla" : "Əlavə et"}
          </span>
        </Button>
      </div>
    </form>
  );
}
