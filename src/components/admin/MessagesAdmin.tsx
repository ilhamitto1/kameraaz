"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMessageStatus, deleteMessage } from "@/actions/admin";
import type { MessageStatus } from "@prisma/client";

type Msg = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: MessageStatus;
  createdAt: string | Date;
};

export function MessagesAdmin({ initial }: { initial: Msg[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className={`space-y-3 ${pending ? "opacity-70" : ""}`}>
      {initial.map((m) => (
        <article key={m.id} className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 sm:rounded-3xl sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">{m.name}</p>
              <p className="break-all text-xs text-[var(--fg-muted)]">
                {m.email} {m.phone ? `· ${m.phone}` : ""} · {m.status}
              </p>
              {m.subject && <p className="mt-1 text-sm">{m.subject}</p>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                className="min-h-9 rounded-lg border border-white/10 px-3 touch-manipulation"
                onClick={() =>
                  start(async () => {
                    await updateMessageStatus(m.id, "READ");
                    router.refresh();
                  })
                }
              >
                Oxunub
              </button>
              <button
                type="button"
                className="min-h-9 rounded-lg border border-white/10 px-3 touch-manipulation"
                onClick={() =>
                  start(async () => {
                    await updateMessageStatus(m.id, "REPLIED");
                    router.refresh();
                  })
                }
              >
                Cavablandı
              </button>
              <button
                type="button"
                className="min-h-9 rounded-lg border border-white/10 px-3 touch-manipulation"
                onClick={() =>
                  start(async () => {
                    await updateMessageStatus(m.id, "ARCHIVED");
                    router.refresh();
                  })
                }
              >
                Arxiv
              </button>
              <button
                type="button"
                className="min-h-9 rounded-lg border border-[var(--danger)]/30 px-3 text-[var(--danger)] touch-manipulation"
                onClick={() => {
                  if (confirm("Silinsin?"))
                    start(async () => {
                      await deleteMessage(m.id);
                      router.refresh();
                    });
                }}
              >
                Sil
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--fg-muted)] whitespace-pre-wrap">{m.message}</p>
        </article>
      ))}
      {!initial.length && <p className="text-[var(--fg-muted)]">Mesaj yoxdur</p>}
    </div>
  );
}
