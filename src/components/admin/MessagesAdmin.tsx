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
    <div className={`space-y-4 ${pending ? "opacity-70" : ""}`}>
      {initial.map((m) => (
        <article key={m.id} className="border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {m.email} {m.phone ? `· ${m.phone}` : ""} · {m.status}
              </p>
              {m.subject && <p className="mt-1 text-sm">{m.subject}</p>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                className="underline"
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
                className="underline"
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
                className="underline"
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
                className="text-[var(--danger)] underline"
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
