"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-salik-600 text-white hover:bg-salik-700 shadow-card",
  secondary: "bg-charcoal-900 text-white hover:bg-charcoal-800 dark:bg-charcoal-100 dark:text-charcoal-900",
  outline: "border border-charcoal-200 hover:bg-charcoal-100 dark:border-charcoal-700 dark:hover:bg-charcoal-800",
  ghost: "hover:bg-charcoal-100 dark:hover:bg-charcoal-800",
  danger: "bg-danger text-white hover:bg-red-700",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
