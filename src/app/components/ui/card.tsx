import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "highlight" | "hoverable";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-card border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all",
  highlight: "bg-card border-2 border-accent shadow-lg",
  hoverable: "bg-card border border-border shadow-sm hover:border-accent/40 hover:bg-bg/10 hover:shadow-md transition-all",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl p-6
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
