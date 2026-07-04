"use client";

import { useEffect, useState } from "react";
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
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time when component mounts on client
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime =
    time?.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) || "";

  return (
    <aside className="w-[216px] bg-sidebar text-sidebar-text flex flex-col flex-shrink-0 h-screen">
      <div className="px-6 py-7 border-b border-white/10">
        <div className="text-[16px] font-bold tracking-tight">WarungCuan</div>
        <div className="text-[11px] opacity-55 mt-1.5">Warung Mama</div>
      </div>

      <nav className="px-4 py-5 flex flex-col gap-2 flex-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 px-4 py-3.5 rounded-[10px] text-[13px] no-underline
                transition-all duration-150
                ${
                  isActive
                    ? "bg-sidebar-active text-accent font-semibold opacity-100 border-l-[3px] border-accent"
                    : "text-sidebar-text opacity-80 hover:opacity-100 font-normal border-l-[3px] border-transparent"
                }
              `}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-[11px] opacity-60 font-mono tabular-nums mb-2.5">
          {formattedTime}
        </div>
        <div className="text-[10px] opacity-40 text-center">
          WarungCuan v1.0
        </div>
      </div>
    </aside>
  );
}
