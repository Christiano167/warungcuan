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
          className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-text mb-3 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel || "Kembali"}
        </Link>
      )}
      <h1 className={`text-2xl font-bold text-text ${description ? "mb-2" : "mb-8"}`}>{title}</h1>
      {description && (
        <p className="text-sm text-text-muted leading-relaxed mb-8 max-w-2xl">{description}</p>
      )}
    </>
  );
}
