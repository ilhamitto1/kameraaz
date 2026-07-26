"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/actions/admin";
import type { SettingsShape } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Form";

export function SettingsForm({ initial }: { initial: SettingsShape }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");

  function set<K extends keyof SettingsShape>(key: K, value: SettingsShape[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      className="max-w-3xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateSiteSettings(form);
          setMsg(res.success ? "Yadda saxlanıldı" : res.error || "Xəta");
          router.refresh();
        });
      }}
    >
      {(
        [
          ["siteName", "Sayt adı"],
          ["whatsappNumber", "WhatsApp nömrəsi"],
          ["phone", "Telefon"],
          ["email", "Email"],
          ["address", "Ünvan"],
          ["workingHours", "İş saatları"],
          ["instagram", "Instagram"],
          ["tiktok", "TikTok"],
          ["youtube", "YouTube"],
          ["heroTitle", "Hero başlıq"],
          ["heroSlogan", "Hero slogan"],
          ["ctaText", "CTA mətn"],
          ["seoTitle", "SEO title"],
          ["mapsUrl", "Google Maps URL"],
          ["announcementBar", "Announcement bar"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
        </div>
      ))}
      <div>
        <Label>WhatsApp mesaj şablonu</Label>
        <Textarea
          value={form.whatsappTemplate}
          onChange={(e) => set("whatsappTemplate", e.target.value)}
          className="min-h-40"
        />
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          Placeholder-lər: {"{name}"} {"{price}"} {"{priceType}"} {"{url}"} {"{dates}"} {"{note}"}
        </p>
      </div>
      <div>
        <Label>Footer mətni</Label>
        <Textarea value={form.footerText} onChange={(e) => set("footerText", e.target.value)} />
      </div>
      <div>
        <Label>SEO description</Label>
        <Textarea
          value={form.seoDescription}
          onChange={(e) => set("seoDescription", e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.maintenanceMode}
          onChange={(e) => set("maintenanceMode", e.target.checked)}
        />
        Maintenance mode
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saxlanılır..." : "Yadda saxla"}
      </Button>
      {msg && <p className="text-sm text-[var(--accent)]">{msg}</p>}
    </form>
  );
}
