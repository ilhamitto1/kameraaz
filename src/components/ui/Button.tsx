import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-[var(--accent)] text-[#050505] hover:brightness-110 font-semibold",
  secondary:
    "glass-panel text-[var(--fg)] hover:border-[var(--border-strong)]",
  ghost: "bg-transparent text-[var(--fg)] hover:bg-white/5",
  whatsapp: "bg-[#25D366] text-[#052e16] hover:brightness-110 font-semibold",
  danger: "bg-[var(--danger)] text-white hover:brightness-110",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm transition-all disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
