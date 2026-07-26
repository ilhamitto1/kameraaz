"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { submitContactForm } from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Form";

export function ContactForm() {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactSchema as any),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((data) => {
        start(async () => {
          const res = await submitContactForm(data);
          if (res.success) {
            setMsg("Mesajınız göndərildi. Tezliklə cavab verəcəyik.");
            reset();
          } else {
            setMsg(res.error || "Xəta baş verdi");
          }
        });
      })}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("honeypot")} />
      <div>
        <Label htmlFor="name">Ad Soyad</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-[var(--danger)]">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div>
        <Label htmlFor="subject">Mövzu</Label>
        <Input id="subject" {...register("subject")} />
      </div>
      <div>
        <Label htmlFor="message">Mesaj</Label>
        <Textarea id="message" {...register("message")} />
        {errors.message && (
          <p className="mt-1 text-xs text-[var(--danger)]">{errors.message.message}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Göndərilir..." : "Göndər"}
      </Button>
      {msg && <p className="text-sm text-[var(--accent)]">{msg}</p>}
    </form>
  );
}
