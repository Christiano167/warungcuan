import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({ title, description, backHref, backLabel }: PageHeaderProps) {
  return (
    <>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-2 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel || "Kembali"}
        </Link>
      )}
      <h1 className="text-[18px] font-bold text-text mb-1">{title}</h1>
      {description && (
        <p className="text-xs text-text-muted mb-6">{description}</p>
      )}
    </>
  );
}
