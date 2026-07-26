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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ul className="space-y-3">
        {bookings.map((b) => (
          <li key={b.id} className="border border-[var(--border)] p-4 flex justify-between gap-3">
            <div>
              <p className="font-medium">{b.product.name}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {new Date(b.startDate).toLocaleDateString("az-AZ")} –{" "}
                {new Date(b.endDate).toLocaleDateString("az-AZ")}
              </p>
              {b.note && <p className="text-sm mt-1">{b.note}</p>}
            </div>
            <button
              type="button"
              className="text-xs text-[var(--danger)] underline"
              onClick={() =>
                start(async () => {
                  await deleteBooking(b.id);
                  router.refresh();
                })
              }
            >
              Sil
            </button>
          </li>
        ))}
      </ul>
      <div className="border border-[var(--border)] p-5 space-y-4">
        <h2 className="display-font text-xl">Yeni rezervasiya</h2>
        <div>
          <Label>Məhsul</Label>
          <select
            className="h-11 w-full border border-[var(--border)] bg-[var(--bg-panel)] px-3"
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Başlanğıc</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Son</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Qeyd</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button
          type="button"
          disabled={pending || !productId || !startDate || !endDate}
          onClick={() =>
            start(async () => {
              await createBooking({ productId, startDate, endDate, note });
              setNote("");
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
