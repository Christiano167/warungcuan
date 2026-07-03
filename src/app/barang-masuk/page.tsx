"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, Select, PageHeader, LoadingState } from "@/app/components/ui";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
  stock: number;
  last_cost: number;
};

type BarangMasukRow = {
  productId: string;
  qty: string;
  total: string;
};

function emptyRow(): BarangMasukRow {
  return { productId: "", qty: "", total: "" };
}

export default function BarangMasukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rows, setRows] = useState<BarangMasukRow[]>([emptyRow()]);

  async function ambilProduk() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilProduk();
  }, []);

  function updateRow(
    index: number,
    field: keyof BarangMasukRow,
    value: string,
  ) {
    setRows(
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function tambahBaris() {
    setRows([...rows, emptyRow()]);
  }

  function hapusBaris(index: number) {
    setRows(rows.filter((_, i) => i !== index));
  }

  const grandTotal = rows.reduce((sum, row) => {
    const total = parseFloat(row.total);
    return sum + (isNaN(total) ? 0 : total);
  }, 0);

  async function simpanBarangMasuk() {
    const validRows = rows.filter(
      (row) => row.productId !== "" && row.qty !== "" && row.total !== "",
    );

    if (validRows.length === 0) {
      alert("Isi minimal 1 baris dengan lengkap");
      return;
    }

    setProcessing(true);

    for (const row of validRows) {
      const product = products.find((p) => p.id === Number(row.productId));
      if (!product) continue;

      const qtyValue = parseInt(row.qty);
      const totalValue = parseFloat(row.total);
      const costPerUnit = totalValue / qtyValue;

      const { data: movementData, error: movementError } = await supabase
        .from("stock_movements")
        .insert({
          product_id: product.id,
          type: "restock",
          qty: qtyValue,
          cost: totalValue,
        })
        .select()
        .single();

      if (movementError || !movementData) {
        console.error(movementError);
        alert(`Gagal menyimpan barang masuk untuk ${product.name}`);
        setProcessing(false);
        return;
      }

      const stokBaru = product.stock + qtyValue;
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: stokBaru, last_cost: costPerUnit })
        .eq("id", product.id);

      if (updateError) {
        console.error(updateError);
        alert(`Gagal update stok ${product.name}`);
        setProcessing(false);
        return;
      }

      const { error: cashflowError } = await supabase.from("cashflow").insert({
        type: "out",
        amount: totalValue,
        source: "restock",
        reference_id: movementData.id,
      });

      if (cashflowError) {
        console.error(cashflowError);
        alert("Gagal mencatat cashflow");
        setProcessing(false);
        return;
      }
    }

    alert("Semua barang masuk berhasil dicatat!");
    setRows([emptyRow()]);
    ambilProduk();
    setProcessing(false);
  }

  return (
    <main className="p-6 md:p-8 max-w-4xl">
      <PageHeader title="Barang Masuk" />
      <Link
        href="/barang-masuk/riwayat"
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text mb-6 transition-all"
      >
        Lihat Riwayat Barang Masuk
        <ArrowRight className="w-3 h-3" />
      </Link>

      {loading ? (
        <LoadingState message="Memuat produk..." />
      ) : (
        <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
          <div className="space-y-5">
            {rows.map((row, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  {index === 0 && (
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">Produk</label>
                  )}
                  <select
                    value={row.productId}
                    onChange={(e) => updateRow(index, "productId", e.target.value)}
                    className="w-full bg-card border border-border text-text rounded-[8px] px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
                  >
                    <option value="">Pilih produk</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  {index === 0 && (
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">Qty</label>
                  )}
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => updateRow(index, "qty", e.target.value)}
                    placeholder="0"
                    className="w-full bg-card border border-border text-text rounded-[8px] px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted/60"
                  />
                </div>

                <div className="w-36">
                  {index === 0 && (
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">Total (Rp)</label>
                  )}
                  <input
                    type="number"
                    value={row.total}
                    onChange={(e) => updateRow(index, "total", e.target.value)}
                    placeholder="0"
                    className="w-full bg-card border border-border text-text rounded-[8px] px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted/60"
                  />
                </div>

                {rows.length > 1 && (
                  <button
                    onClick={() => hapusBaris(index)}
                    className="text-danger hover:text-danger/80 pb-2.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={tambahBaris} className="inline-flex items-center gap-1 text-xs text-accent hover:opacity-80 font-bold mt-4 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            Tambah Baris
          </button>

          <div className="border-t border-border mt-6 pt-5 flex justify-between font-bold text-text text-base">
            <span>Grand Total</span>
            <span className="tabular-nums">Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>

          <Button
            disabled={processing}
            onClick={simpanBarangMasuk}
            loading={processing}
            className="w-full mt-6"
          >
            Simpan Semua
          </Button>
        </div>
      )}
    </main>
  );
}
