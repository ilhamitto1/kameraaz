export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 pb-24 pt-28 sm:px-5 md:px-8">
      <div className="h-3 w-20 rounded bg-white/10" />
      <div className="mt-4 h-12 w-1/2 max-w-sm rounded bg-white/10" />
      <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/5" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-h-[280px] border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}
