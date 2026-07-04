"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-text rounded-lg shadow-sm hover:opacity-90 disabled:bg-border disabled:text-text-muted",
  secondary:
    "border border-border text-text bg-transparent hover:bg-bg rounded-lg disabled:bg-border disabled:text-text-muted",
  ghost:
    "bg-transparent border-none text-text hover:bg-bg/50 rounded-lg disabled:text-text-muted",
  danger:
    "bg-danger text-white rounded-lg hover:bg-danger/90 disabled:bg-border disabled:text-text-muted",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex min-h-11 items-center justify-center gap-2.5
          px-5 py-2.5 text-sm font-bold
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
