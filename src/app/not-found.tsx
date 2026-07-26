import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-5 text-center">
      <p className="mono text-xs text-[var(--accent)]">ERROR 404</p>
      <h1 className="display-font mt-4 text-5xl md:text-7xl">Fokusdan çıxdı</h1>
      <p className="mt-4 max-w-md text-[var(--fg-muted)]">
        Axtardığınız kadr kadrdan kənarda qaldı. Ana səhifəyə qayıdıb yenidən fokuslanın.
      </p>
      <Link
        href="/"
        className="mt-8 bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#050505]"
      >
        Ana səhifə
      </Link>
    </div>
  );
}
