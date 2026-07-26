"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email və ya şifrə yanlışdır");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-[#050505] px-4 py-8"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[var(--bg-elevated)] p-6 sm:p-8"
      >
        <p className="mono text-xs text-[var(--accent)]">ADMIN</p>
        <h1 className="display-font mt-2 text-2xl sm:text-3xl">Kameraz Panel</h1>
        <div className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div>
            <Label htmlFor="password">Şifrə</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12 rounded-xl text-base"
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={loading}>
            {loading ? "Yoxlanılır..." : "Daxil ol"}
          </Button>
        </div>
      </form>
    </div>
  );
}
