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
            className="block text-xs font-semibold text-text-muted mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full bg-card border border-border text-text
            rounded-[8px] px-3 py-2 text-sm
            outline-none
            focus:border-accent focus:ring-1 focus:ring-accent/50
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
