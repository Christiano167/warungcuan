"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

      // 1. Insert ke stock_movements
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

      // 2. Update stok & lastCost produk
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

      // 3. Catat cashflow keluar
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
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Barang Masuk</h1>
      <Link
        href="/BarangMasuk/riwayat"
        className="text-sm text-blue-600 block mb-4"
      >
        Lihat Riwayat →
      </Link>
      {loading ? (
        <p>Memuat produk...</p>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  {index === 0 && (
                    <label className="block text-xs text-gray-500 mb-1">
                      Produk
                    </label>
                  )}
                  <select
                    value={row.productId}
                    onChange={(e) =>
                      updateRow(index, "productId", e.target.value)
                    }
                    className="w-full border rounded px-2 py-2 text-sm"
                  >
                    <option value="">Pilih produk</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  {index === 0 && (
                    <label className="block text-xs text-gray-500 mb-1">
                      Qty
                    </label>
                  )}
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) => updateRow(index, "qty", e.target.value)}
                    placeholder="0"
                    className="w-full border rounded px-2 py-2 text-sm"
                  />
                </div>

                <div className="w-28">
                  {index === 0 && (
                    <label className="block text-xs text-gray-500 mb-1">
                      Total (Rp)
                    </label>
                  )}
                  <input
                    type="number"
                    value={row.total}
                    onChange={(e) => updateRow(index, "total", e.target.value)}
                    placeholder="0"
                    className="w-full border rounded px-2 py-2 text-sm"
                  />
                </div>

                {rows.length > 1 && (
                  <button
                    onClick={() => hapusBaris(index)}
                    className="text-red-600 text-sm pb-2"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={tambahBaris} className="text-sm text-blue-600 mt-3">
            + Tambah Baris
          </button>

          <div className="border-t mt-4 pt-3 flex justify-between font-bold">
            <span>Grand Total</span>
            <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>

          <button
            disabled={processing}
            onClick={simpanBarangMasuk}
            className="w-full bg-green-700 text-white rounded py-2 font-medium mt-3 disabled:opacity-40"
          >
            {processing ? "Memproses..." : "Simpan Semua"}
          </button>
        </div>
      )}
    </main>
  );
}
