import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 rounded-sm bg-[var(--bg-panel)] border border-[var(--border)] px-3 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-28 rounded-sm bg-[var(--bg-panel)] border border-[var(--border)] px-3 py-2 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs uppercase tracking-[0.14em] text-[var(--fg-muted)] mb-2", className)}
      {...props}
    />
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider border border-[var(--border)] text-[var(--fg-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RecIndicator({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const on = status === "AVAILABLE";
  return (
    <span className="inline-flex items-center gap-2 text-xs mono uppercase tracking-wider">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          on ? "bg-[var(--rec)] animate-pulse shadow-[0_0_8px_var(--rec)]" : "bg-[var(--fg-muted)]",
        )}
      />
      {label}
    </span>
  );
}

export function TimecodePrice({
  value,
  suffix = "AZN / gün",
  className,
}: {
  value: string | number | null | undefined;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("mono text-[var(--accent)] tracking-wider", className)}>
      <span className="text-lg font-medium">{value ?? "—"}</span>
      <span className="text-[var(--fg-muted)] text-xs ml-2">{suffix}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white/5 rounded-sm", className)} />;
}
