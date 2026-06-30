"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    <main className="p-6 max-w-2xl mx-auto">
      <Link href="/BarangMasuk" className="text-sm text-blue-600">
        ← Kembali
      </Link>

      <h1 className="text-xl font-bold mt-2 mb-4">Riwayat Barang Masuk</h1>
        
      {loading ? (
        <p>Memuat riwayat...</p>
      ) : movements.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada riwayat</p>
      ) : (
        <ul className="space-y-2">
          {movements.map((m) => (
            <li
              key={m.id}
              className={`border rounded-lg p-3 flex justify-between text-sm ${
                m.status === "void" ? "opacity-50" : ""
              }`}
            >
              <div>
                <div className="font-medium">
                  {m.products?.name ?? "Produk tidak diketahui"}
                  {m.status === "void" && (
                    <span className="text-red-600 ml-2 text-xs">[VOID]</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(m.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-right">
                <div>Qty: {m.qty}</div>
                <div className="text-gray-500">
                  Rp {(m.cost ?? 0).toLocaleString("id-ID")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
