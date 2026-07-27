"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking, deleteBooking } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

type Booking = {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  note?: string | null;
  product: { id: string; name: string; slug: string };
};

export function BookingsAdmin({
  bookings,
  products,
}: {
  bookings: Booking[];
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <ul className="order-2 space-y-3 lg:order-1">
        {bookings.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-[var(--fg-muted)]">
            Hələ rezervasiya yoxdur.
          </li>
        )}
        {bookings.map((b) => (
          <li
            key={b.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{b.product?.name || "Məhsul"}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {new Date(b.startDate).toLocaleDateString("az-AZ")} –{" "}
                {new Date(b.endDate).toLocaleDateString("az-AZ")}
              </p>
              {b.note && <p className="mt-1 text-sm">{b.note}</p>}
            </div>
            <button
              type="button"
              className="min-h-9 self-start rounded-lg border border-[var(--danger)]/30 px-3 text-xs text-[var(--danger)] touch-manipulation"
              onClick={() =>
                start(async () => {
                  const res = await deleteBooking(b.id);
                  if (!res.success) {
                    alert("Silinmədi");
                    return;
                  }
                  router.refresh();
                })
              }
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
      <div className="order-1 space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:p-5 lg:order-2">
        <h2 className="display-font text-xl">Yeni rezervasiya</h2>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        {!products.length ? (
          <p className="text-sm text-[var(--fg-muted)]">Əvvəlcə məhsul əlavə edin.</p>
        ) : (
          <>
            <div>
              <Label>Məhsul</Label>
              <select
                className="h-11 w-full rounded-xl border border-white/10 bg-[var(--bg-panel)] px-3"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Başlanğıc</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="min-h-11 rounded-xl"
                />
              </div>
              <div>
                <Label>Bitmə</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="min-h-11 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label>Qeyd</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl" />
            </div>
            <Button
              type="button"
              className="min-h-11 w-full rounded-xl sm:w-auto"
              disabled={pending || !productId || !startDate || !endDate}
              onClick={() =>
                start(async () => {
                  setError("");
                  const res = await createBooking({ productId, startDate, endDate, note });
                  if (!res.success) {
                    setError(res.error || "Əlavə edilmədi");
                    return;
                  }
                  setNote("");
                  setStartDate("");
                  setEndDate("");
                  router.refresh();
                })
              }
            >
              Əlavə et
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
