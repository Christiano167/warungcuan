import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text-muted mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full h-12 bg-card border border-border text-text
            rounded-lg px-4 py-2.5 text-sm
            outline-none
            focus:border-accent focus:ring-1 focus:ring-accent/30
            transition-all
            disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
