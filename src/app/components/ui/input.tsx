import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-muted mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-12 bg-card border border-border text-text
            rounded-lg px-4 py-2.5 text-sm
            outline-none
            focus:border-accent focus:ring-1 focus:ring-accent/30
            transition-all
            placeholder:text-text-muted/50
            disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
