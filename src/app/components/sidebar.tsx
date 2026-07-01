"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "Kasir", href: "/kasir" },
  { label: "Produk", href: "/" },
  { label: "Bon", href: "/bon" },
  { label: "Barang Masuk", href: "/BarangMasuk" },
  { label: "Stock Adjustment", href: "/StockAdjustment" },
  { label: "Pengeluaran", href: "/pengeluaran" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 bg-blue-900 text-white flex flex-col shrink-0" >
      <div className="px-4 py-4 border-b border-white/15">
        <div className="text-base font-semibold">WarungCuan</div>
        <div className="text-xs opacity-70">Warung Mama</div>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/20 font-medium"
                  : "opacity-85 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
