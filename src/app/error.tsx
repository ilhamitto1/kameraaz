"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-5 text-center">
      <p className="mono text-xs text-[var(--danger)]">SERVER ERROR</p>
      <h1 className="display-font mt-4 text-4xl md:text-6xl">Çəkiliş müvəqqəti dayandırıldı</h1>
      <p className="mt-4 max-w-md text-[var(--fg-muted)]">
        {error.message || "Gözlənilməz xəta baş verdi."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-[var(--border)] px-6 py-3 text-sm"
      >
        Yenidən cəhd et
      </button>
    </div>
  );
}
