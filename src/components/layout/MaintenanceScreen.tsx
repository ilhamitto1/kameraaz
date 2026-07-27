export function MaintenanceScreen({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-center">
      <p className="mono text-xs text-[var(--accent)]">MAINTENANCE MODE</p>
      <h1 className="display-font mt-4 text-4xl md:text-6xl">Tezliklə qayıdırıq</h1>
      <p className="mt-4 max-w-md text-[var(--fg-muted)]">
        {message || "Sayt hazırda texniki yenilənmə keçirir. Tezliklə yenidən açılacaq."}
      </p>
    </div>
  );
}
