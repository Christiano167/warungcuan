"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  product: Product;
  qty: number;
};

export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const ambilProduk = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilProduk();
  }, [ambilProduk]);

  async function generateNomorTransaksi() {
    const { count, error } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(error);
      return null;
    }

    const nextNumber = (count ?? 0) + 1;
    return `TRX-${String(nextNumber).padStart(6, "0")}`;
  }

  async function bayar() {
    if (cart.length === 0) return;

    setProcessing(true);

    const nomorTransaksi = await generateNomorTransaksi();
    if (!nomorTransaksi) {
      alert("Gagal membuat nomor transaksi");
      setProcessing(false);
      return;
    }

    // 1. Insert ke transactions
    const { data: trxData, error: trxError } = await supabase
      .from("transactions")
      .insert({
        transaction_number: nomorTransaksi,
        total: totalHarga,
        payment_type: "cash",
      })
      .select()
      .single();

    if (trxError || !trxData) {
      console.error(trxError);
      alert("Gagal menyimpan transaksi");
      setProcessing(false);
      return;
    }

    // 2. Insert ke transaction_items (satu per produk di cart)
    const items = cart.map((item) => ({
      transaction_id: trxData.id,
      product_id: item.product.id,
      qty: item.qty,
      price_snapshot: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(items);

    if (itemsError) {
      console.error(itemsError);
      alert("Gagal menyimpan detail transaksi");
      setProcessing(false);
      return;
    }

    // 3. Update stok tiap produk
    for (const item of cart) {
      const stokBaru = item.product.stock - item.qty;
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: stokBaru })
        .eq("id", item.product.id);

      if (stockError) {
        console.error(stockError);
        alert(`Gagal update stok ${item.product.name}`);
        setProcessing(false);
        return;
      }
    }

    // 4. Catat ke cashflow
    const { error: cashflowError } = await supabase.from("cashflow").insert({
      type: "in",
      amount: totalHarga,
      source: "sale",
      reference_id: trxData.id,
    });

    if (cashflowError) {
      console.error(cashflowError);
      alert("Gagal mencatat cashflow");
      setProcessing(false);
      return;
    }

    alert(`Transaksi ${nomorTransaksi} berhasil!`);
    setCart([]);
    ambilProduk();
    setProcessing(false);
  }

  function tambahKeCart(product: Product) {
    const existing = cart.find((item) => item.product.id === product.id);

    if (existing) {
      if (existing.qty + 1 > product.stock) {
        alert(`Stok ${product.name} tidak cukup`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        ),
      );
    } else {
      if (product.stock < 1) {
        alert(`Stok ${product.name} habis`);
        return;
      }
      setCart([...cart, { product, qty: 1 }]);
    }
  }

  function kosongkanCart() {
    setCart([]);
  }

  const totalHarga = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Kasir</h1>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Daftar Produk</h2>
          {loading ? (
            <p>Memuat produk...</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => tambahKeCart(p)}
                  className="w-full text-left border rounded-lg p-3 hover:bg-green-50"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    Rp {p.price.toLocaleString("id-ID")} · Stok: {p.stock}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">Keranjang</h2>
            {cart.length > 0 && (
              <button onClick={kosongkanCart} className="text-sm text-red-600">
                Kosongkan
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm">Keranjang masih kosong</p>
          ) : (
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <div>
                    {item.product.name} x {item.qty}
                  </div>
                  <div>
                    Rp {(item.product.price * item.qty).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-3">
            <div className="flex justify-between font-bold text-lg mb-3">
              <span>Total</span>
              <span>Rp {totalHarga.toLocaleString("id-ID")}</span>
            </div>
            <button
              disabled={cart.length === 0 || processing}
              onClick={bayar}
              className="w-full bg-green-700 text-white rounded py-2 font-medium disabled:opacity-40"
            >
              {processing ? "Memproses..." : "Bayar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
