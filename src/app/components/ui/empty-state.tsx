import { Package, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  submessage?: string;
}

export function EmptyState({ icon: Icon = Package, message, submessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-8 h-8 text-text-muted/30 mb-2" />
      <p className="text-sm text-text-muted">{message}</p>
      {submessage && (
        <p className="text-xs text-text-muted/70 mt-1">{submessage}</p>
      )}
    </div>
  );
}
