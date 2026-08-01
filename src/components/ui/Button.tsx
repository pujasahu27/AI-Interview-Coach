import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

type Variant = "gold" | "dark" | "ghost" | "outline-gold";

const VARIANT_CLASSES: Record<Variant, string> = {
  gold: "bg-gold text-on-accent font-semibold shadow-[0_0_20px_rgba(240,180,41,.3)] hover:bg-[#f5c040] hover:shadow-[0_0_36px_rgba(240,180,41,.55)] hover:-translate-y-0.5",
  dark: "bg-surface-elevated text-foreground border border-line2 hover:bg-line hover:-translate-y-0.5",
  ghost: "bg-transparent text-foreground border border-line2 hover:border-muted hover:text-white hover:-translate-y-0.5",
  "outline-gold": "bg-transparent text-gold border border-gold/45 hover:bg-gold-faint hover:-translate-y-0.5",
};

type BaseProps = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
};

const SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

function classes({
  variant = "gold",
  size = "md",
  fullWidth,
}: Pick<BaseProps, "variant" | "size" | "fullWidth">) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? "w-full" : "",
  ].join(" ");
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${classes({ variant, size, fullWidth })} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = BaseProps & {
  href: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function LinkButton({
  href,
  variant,
  size,
  fullWidth,
  className,
  children,
  onClick,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${classes({ variant, size, fullWidth })} ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
