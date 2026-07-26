export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 pb-24 pt-28 sm:px-5 md:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[4/3] border border-white/10 bg-white/[0.03]" />
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-10 w-3/4 rounded bg-white/10" />
          <div className="h-20 w-full rounded bg-white/5" />
          <div className="h-12 w-40 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
