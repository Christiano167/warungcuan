import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "highlight" | "hoverable";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-card border border-border shadow-sm",
  highlight: "bg-card border-2 border-accent shadow-md",
  hoverable: "bg-card border border-border shadow-sm hover:border-accent/40 hover:bg-bg/10 transition-all",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-[10px] p-5
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
