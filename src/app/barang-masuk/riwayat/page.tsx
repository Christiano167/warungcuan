"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, PageHeader, LoadingState, EmptyState } from "@/app/components/ui";
import { ArrowLeft } from "lucide-react";

type Movement = {
  id: number;
  qty: number;
  cost: number | null;
  status: string;
  created_at: string;
  products: { name: string } | null;
};

export default function RiwayatBarangMasukPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  async function ambilRiwayat() {
    setLoading(true);
    const { data, error } = await supabase
      .from("stock_movements")
      .select("id, qty, cost, status, created_at, products(name)")
      .eq("type", "restock")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setMovements(data as unknown as Movement[]);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilRiwayat();
  }, []);

  return (
    <main className="p-6 md:p-8 max-w-2xl">
      <Link href="/barang-masuk" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-2 transition-all">
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Barang Masuk
      </Link>

      <PageHeader title="Riwayat Barang Masuk" />

      {loading ? (
        <LoadingState message="Memuat riwayat..." />
      ) : movements.length === 0 ? (
        <EmptyState message="Belum ada riwayat" />
      ) : (
        <div className="space-y-3.5">
          {movements.map((m) => (
            <Card
              key={m.id}
              variant={m.status === "void" ? "default" : "hoverable"}
              className={`flex justify-between items-center text-sm ${m.status === "void" ? "opacity-50" : ""}`}
            >
              <div>
                <div className="font-semibold text-text flex items-center gap-2">
                  {m.products?.name ?? "Produk tidak diketahui"}
                  {m.status === "void" && (
                    <span className="bg-danger-light text-danger text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Void</span>
                  )}
                </div>
                <div className="text-text-muted text-[10px] mt-1">
                  {new Date(m.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="font-medium text-text text-xs tabular-nums">Qty: {m.qty}</div>
                <div className="font-bold text-accent text-sm mt-0.5 tabular-nums">
                  Rp {(m.cost ?? 0).toLocaleString("id-ID")}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
