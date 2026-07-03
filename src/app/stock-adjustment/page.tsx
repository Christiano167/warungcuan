"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, Select, PageHeader, LoadingState, EmptyState } from "@/app/components/ui";

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
    <main className="p-6 md:p-8 max-w-2xl">
      <PageHeader
        title="Stock Adjustment"
        description="Khusus untuk barang rusak, hilang, kadaluarsa, atau selisih stok fisik. Tidak mempengaruhi kas."
      />

      {loading ? (
        <LoadingState message="Memuat data..." />
      ) : (
        <>
          <div className="bg-card border border-border rounded-[10px] p-6 space-y-5 mb-8 max-w-md shadow-sm">
            <Select
              label="Produk"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Pilih produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok: {p.stock})
                </option>
              ))}
            </Select>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">Jenis</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection("add")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                    direction === "add"
                      ? "bg-accent text-accent-text"
                      : "bg-transparent border border-border text-text hover:bg-bg/50"
                  }`}
                >
                  Tambah Stok
                </button>
                <button
                  onClick={() => setDirection("subtract")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                    direction === "subtract"
                      ? "bg-danger text-white"
                      : "bg-transparent border border-border text-text hover:bg-bg/50"
                  }`}
                >
                  Kurangi Stok
                </button>
              </div>
            </div>

            <Input
              label="Jumlah"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
            />

            <Input
              label="Alasan (wajib)"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: barang rusak, kadaluarsa, dll"
            />

            <Button
              disabled={processing}
              onClick={simpanAdjustment}
              loading={processing}
              className="w-full"
            >
              Simpan Adjustment
            </Button>
          </div>

          <h2 className="font-semibold text-text text-sm mb-4">Riwayat</h2>
          {adjustments.length === 0 ? (
            <EmptyState message="Belum ada riwayat" />
          ) : (
            <div className="space-y-3.5 max-w-xl">
              {adjustments.map((a) => (
                <Card
                  key={a.id}
                  variant={a.status === "void" ? "default" : "hoverable"}
                  className={a.status === "void" ? "opacity-50" : ""}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-text flex items-center gap-2">
                      {a.products?.name ?? "Produk tidak diketahui"}
                      {a.status === "void" && (
                        <span className="bg-danger-light text-danger text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Void</span>
                      )}
                    </div>
                    <div className={`font-bold tabular-nums ${a.qty > 0 ? "text-accent" : "text-danger"}`}>
                      {a.qty > 0 ? "+" : ""}{a.qty}
                    </div>
                  </div>
                  {a.note && <div className="text-text-muted text-xs mt-1">{a.note}</div>}
                  <div className="text-text-muted text-[10px] mt-1.5">
                    {new Date(a.created_at).toLocaleString("id-ID")}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
