export function AnnouncementBar({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[60] border-b border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2 text-center text-xs text-[var(--fg)] backdrop-blur-md">
      {text}
    </div>
  );
}
