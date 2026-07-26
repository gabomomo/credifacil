import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_10px_24px_-10px_rgba(92,114,207,0.6)] hover:shadow-[0_14px_30px_-10px_rgba(92,114,207,0.7)] hover:-translate-y-0.5",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 shadow-[0_10px_24px_-10px_rgba(37,154,115,0.6)] hover:-translate-y-0.5",
  outline:
    "border-2 border-brand-200 text-brand-700 hover:border-brand-600 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  white:
    "bg-white text-brand-700 hover:bg-brand-50 shadow-soft hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-[0.95rem] px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
