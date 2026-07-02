"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "Kasir", href: "/kasir" },
  { label: "Produk", href: "/" },
  { label: "Bon", href: "/bon" },
  { label: "Barang Masuk", href: "/barang-masuk" },
  { label: "Stock Adjustment", href: "/stock-adjustment" },
  { label: "Pengeluaran", href: "/pengeluaran" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "180px",
      background: "var(--sidebar)",
      color: "var(--sidebar-text)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      height: "100vh",
    }}>
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>
          WarungCuan
        </div>
        <div style={{ fontSize: "11px", opacity: 0.55, marginTop: "2px" }}>
          Warung Mama
        </div>
      </div>

      <nav style={{
        padding: "10px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
      }}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                background: isActive ? "var(--sidebar-active)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--sidebar-text)",
                opacity: isActive ? 1 : 0.8,
                textDecoration: "none",
                transition: "all 0.15s",
                borderLeft: isActive ? `3px solid var(--accent)` : "3px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        fontSize: "10px",
        opacity: 0.4,
      }}>
        WarungCuan v1.0
      </div>
    </aside>
  );
}