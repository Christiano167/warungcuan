import { HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "danger" | "success" | "outline" | "void";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  danger: "bg-danger-light text-danger",
  success: "bg-[#E8FFF5] text-[#1A7A50]",
  outline: "bg-transparent border border-border text-text-muted",
  void: "bg-danger-light text-danger",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "danger", className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center
          text-[9px] font-bold uppercase tracking-wider
          px-1.5 py-0.5 rounded
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
