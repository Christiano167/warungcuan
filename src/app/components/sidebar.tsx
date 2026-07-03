"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  FileText,
  PackagePlus,
  Scale,
  DollarSign,
  LayoutDashboard,
} from "lucide-react";

const MENU_ITEMS = [
  { label: "Kasir", href: "/kasir", icon: ShoppingCart },
  { label: "Produk", href: "/", icon: Package },
  { label: "Bon", href: "/bon", icon: FileText },
  { label: "Barang Masuk", href: "/barang-masuk", icon: PackagePlus },
  { label: "Stock Adjustment", href: "/stock-adjustment", icon: Scale },
  { label: "Pengeluaran", href: "/pengeluaran", icon: DollarSign },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[180px] bg-sidebar text-sidebar-text flex flex-col flex-shrink-0 h-screen">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="text-[16px] font-bold tracking-tight">WarungCuan</div>
        <div className="text-[11px] opacity-55 mt-1">Warung Mama</div>
      </div>

      <nav className="p-3 flex flex-col gap-1.5 flex-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3.5 py-3 rounded-[8px] text-[13px] no-underline
                transition-all duration-150
                ${isActive
                  ? "bg-sidebar-active text-accent font-semibold opacity-100 border-l-[3px] border-accent"
                  : "text-sidebar-text opacity-80 hover:opacity-100 font-normal border-l-[3px] border-transparent"
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[10px] opacity-40">
        WarungCuan v1.0
      </div>
    </aside>
  );
}
