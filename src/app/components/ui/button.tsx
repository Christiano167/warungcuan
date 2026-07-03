"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-text hover:bg-accent/90 disabled:bg-border disabled:text-text-muted",
  secondary:
    "bg-transparent border border-border text-text hover:bg-bg/50 disabled:bg-border disabled:text-text-muted",
  ghost:
    "bg-transparent border-none text-text hover:bg-bg/50 disabled:text-text-muted",
  danger:
    "bg-danger text-white hover:bg-danger/90 disabled:bg-border disabled:text-text-muted",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          px-5 py-2.5 text-sm font-bold rounded-[8px]
          transition-all duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
          active:scale-[0.98]
          disabled:cursor-not-allowed
          cursor-pointer
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {loading ? "Memproses..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
