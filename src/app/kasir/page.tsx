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
  const [showPayment, setShowPayment] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [customerName, setCustomerName] = useState("");

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

    const cashValue = parseFloat(cashReceived);
    const isKurang = cashValue < totalHarga;

    if (isKurang && customerName.trim() === "") {
      alert("Nama pelanggan wajib diisi untuk bon");
      return;
    }

    setProcessing(true);

    const nomorTransaksi = await generateNomorTransaksi();
    if (!nomorTransaksi) {
      alert("Gagal membuat nomor transaksi");
      setProcessing(false);
      return;
    }

    let customerId: number | null = null;

    // Kalau bon, cari/buat customer dulu
    if (isKurang) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("*")
        .eq("name", customerName.trim())
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({ name: customerName.trim() })
          .select()
          .single();

        if (customerError || !newCustomer) {
          console.error(customerError);
          alert("Gagal membuat data pelanggan");
          setProcessing(false);
          return;
        }
        customerId = newCustomer.id;
      }
    }

    // 1. Insert ke transactions
    const { data: trxData, error: trxError } = await supabase
      .from("transactions")
      .insert({
        transaction_number: nomorTransaksi,
        total: totalHarga,
        payment_type: isKurang ? "bon" : "cash",
        cash_received: cashValue,
        change: isKurang ? 0 : cashValue - totalHarga,
        customer_id: customerId,
      })
      .select()
      .single();

    if (trxError || !trxData) {
      console.error(trxError);
      alert("Gagal menyimpan transaksi");
      setProcessing(false);
      return;
    }

    // 2. Insert ke transaction_items
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

    // 4. Kalau bon: catat ke debts + update total_debt customer
    if (isKurang && customerId) {
      const kurangAmount = totalHarga - cashValue;

      const { error: debtError } = await supabase.from("debts").insert({
        customer_id: customerId,
        amount: kurangAmount,
        type: "charge",
        transaction_id: trxData.id,
      });

      if (debtError) {
        console.error(debtError);
        alert("Gagal mencatat hutang");
        setProcessing(false);
        return;
      }

      const { data: custData } = await supabase
        .from("customers")
        .select("total_debt")
        .eq("id", customerId)
        .single();

      const newTotalDebt = (custData?.total_debt ?? 0) + kurangAmount;

      const { error: updateDebtError } = await supabase
        .from("customers")
        .update({ total_debt: newTotalDebt })
        .eq("id", customerId);

      if (updateDebtError) {
        console.error(updateDebtError);
        alert("Gagal update total hutang pelanggan");
        setProcessing(false);
        return;
      }
    }

    // 5. Cashflow: kalau cash, catat 'sale'. Kalau bon, catat sebesar yang DIBAYAR aja (cashValue), bukan total
    const cashflowAmount = isKurang ? cashValue : totalHarga;
    if (cashflowAmount > 0) {
      const { error: cashflowError } = await supabase.from("cashflow").insert({
        type: "in",
        amount: cashflowAmount,
        source: "sale",
        reference_id: trxData.id,
      });

      if (cashflowError) {
        console.error(cashflowError);
        alert("Gagal mencatat cashflow");
        setProcessing(false);
        return;
      }
    }

    alert(`Transaksi ${nomorTransaksi} berhasil!`);
    setCart([]);
    setShowPayment(false);
    setCashReceived("");
    setCustomerName("");
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
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
              className="w-full bg-green-700 text-white rounded py-2 font-medium disabled:opacity-40"
            >
              Bayar
            </button>
            {showPayment && (
              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-medium mb-1">
                  Uang Diterima
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="w-full border rounded px-3 py-2 mb-2"
                  autoFocus
                />

                {cashReceived !== "" && (
                  <div className="text-sm mb-3">
                    {parseFloat(cashReceived) >= totalHarga ? (
                      <div className="text-green-700 font-medium">
                        Kembalian: Rp{" "}
                        {(parseFloat(cashReceived) - totalHarga).toLocaleString(
                          "id-ID",
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600 font-medium">
                        Kurang: Rp{" "}
                        {(totalHarga - parseFloat(cashReceived)).toLocaleString(
                          "id-ID",
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {cashReceived !== "" &&
                    parseFloat(cashReceived) < totalHarga && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                          Nama Pelanggan (untuk bon)
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nama pelanggan"
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    )}
                  <button
                    onClick={() => {
                      setShowPayment(false);
                      setCashReceived("");
                    }}
                    className="flex-1 border rounded py-2 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    disabled={processing || cashReceived === ""}
                    onClick={bayar}
                    className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-40"
                  >
                    {processing ? "Memproses..." : "Konfirmasi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
