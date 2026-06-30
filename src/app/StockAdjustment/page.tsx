"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  stock: number;
};

type Adjustment = {
  id: number;
  qty: number;
  note: string | null;
  status: string;
  created_at: string;
  products: { name: string } | null;
};

export default function StockAdjustmentPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [direction, setDirection] = useState<"add" | "subtract">("subtract");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");

  async function ambilData() {
    setLoading(true);

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (productsError) {
      console.error(productsError);
      setLoading(false);
      return;
    }
    setProducts(productsData);

    const { data: adjustmentsData, error: adjustmentsError } = await supabase
      .from("stock_movements")
      .select("id, qty, note, status, created_at, products(name)")
      .eq("type", "adjustment")
      .order("created_at", { ascending: false });

    if (adjustmentsError) {
      console.error(adjustmentsError);
      setLoading(false);
      return;
    }
    setAdjustments(adjustmentsData as unknown as Adjustment[]);

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilData();
  }, []);

  async function simpanAdjustment() {
    if (!selectedProductId || qty === "" || reason.trim() === "") {
      alert("Semua field wajib diisi, termasuk alasan");
      return;
    }

    const qtyValue = parseInt(qty);
    if (qtyValue <= 0) {
      alert("Jumlah harus lebih dari 0");
      return;
    }

    const product = products.find((p) => p.id === Number(selectedProductId));
    if (!product) {
      alert("Produk tidak ditemukan");
      return;
    }

    const actualQty = direction === "add" ? qtyValue : -qtyValue;
    const stokBaru = product.stock + actualQty;

    if (stokBaru < 0) {
      alert("Stok tidak boleh menjadi negatif");
      return;
    }

    setProcessing(true);

    // 1. Insert ke stock_movements
    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: product.id,
        type: "adjustment",
        qty: actualQty,
        note: reason.trim(),
      });

    if (movementError) {
      console.error(movementError);
      alert("Gagal menyimpan adjustment");
      setProcessing(false);
      return;
    }

    // 2. Update stok produk (TIDAK menyentuh cashflow)
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: stokBaru })
      .eq("id", product.id);

    if (updateError) {
      console.error(updateError);
      alert("Gagal update stok produk");
      setProcessing(false);
      return;
    }

    alert("Stock adjustment berhasil dicatat!");
    setSelectedProductId("");
    setQty("");
    setReason("");
    ambilData();
    setProcessing(false);
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Stock Adjustment</h1>
      <p className="text-xs text-gray-500 mb-4">
        Khusus untuk barang rusak, hilang, kadaluarsa, atau selisih stok fisik.
        Tidak mempengaruhi kas.
      </p>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <>
          <div className="border rounded-lg p-4 space-y-3 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Produk</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Pilih produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1  ">Jenis</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection("add")}
                  className={`flex-1 border rounded py-2 text-sm font-medium ${
                    direction === "add" ? "bg-green-700 text-white" : "bg-white"
                  }`}
                >
                  Tambah Stok
                </button>
                <button
                  onClick={() => setDirection("subtract")}
                  className={`flex-1 border rounded py-2 text-sm font-medium ${
                    direction === "subtract"
                      ? "bg-red-600 text-white"
                      : "bg-white"
                  }`}
                >
                  Kurangi Stok
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Jumlah</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Alasan (wajib)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: barang rusak, kadaluarsa, dll"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              disabled={processing}
              onClick={simpanAdjustment}
              className="w-full bg-green-700 text-white rounded py-2 font-medium disabled:opacity-40"
            >
              {processing ? "Memproses..." : "Simpan Adjustment"}
            </button>
          </div>

          <h2 className="font-medium mb-2">Riwayat</h2>
          {adjustments.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada riwayat</p>
          ) : (
            <ul className="space-y-2">
              {adjustments.map((a) => (
                <li
                  key={a.id}
                  className={`border rounded-lg p-3 text-sm ${
                    a.status === "void" ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {a.products?.name ?? "Produk tidak diketahui"}
                    </div>
                    <div
                      className={a.qty > 0 ? "text-green-700" : "text-red-600"}
                    >
                      {a.qty > 0 ? "+" : ""}
                      {a.qty}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">{a.note}</div>
                  <div className="text-gray-400 text-xs">
                    {new Date(a.created_at).toLocaleString("id-ID")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
