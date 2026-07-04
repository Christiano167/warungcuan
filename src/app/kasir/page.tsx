"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button, PageHeader, EmptyState } from "@/app/components/ui";
import { Search, ShoppingCart, Package } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  async function generateNomorTransaksi() {
    const { count, error } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error(error);
      return null;
    }
    return `TRX-${String((count ?? 0) + 1).padStart(6, "0")}`;
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
    if (isKurang) {
      const { data: existing } = await supabase
        .from("customers")
        .select("*")
        .eq("name", customerName.trim())
        .maybeSingle();
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newC, error: cErr } = await supabase
          .from("customers")
          .insert({ name: customerName.trim() })
          .select()
          .single();
        if (cErr || !newC) {
          alert("Gagal membuat pelanggan");
          setProcessing(false);
          return;
        }
        customerId = newC.id;
      }
    }
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
      alert("Gagal menyimpan transaksi");
      setProcessing(false);
      return;
    }
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
      alert("Gagal menyimpan detail transaksi");
      setProcessing(false);
      return;
    }
    for (const item of cart) {
      const { error: sErr } = await supabase
        .from("products")
        .update({ stock: item.product.stock - item.qty })
        .eq("id", item.product.id);
      if (sErr) {
        alert(`Gagal update stok ${item.product.name}`);
        setProcessing(false);
        return;
      }
    }
    if (isKurang && customerId) {
      const kurang = totalHarga - cashValue;
      await supabase
        .from("debts")
        .insert({
          customer_id: customerId,
          amount: kurang,
          type: "charge",
          transaction_id: trxData.id,
        });
      const { data: cData } = await supabase
        .from("customers")
        .select("total_debt")
        .eq("id", customerId)
        .single();
      await supabase
        .from("customers")
        .update({ total_debt: (cData?.total_debt ?? 0) + kurang })
        .eq("id", customerId);
    }
    const cashflowAmount = isKurang ? cashValue : totalHarga;
    if (cashflowAmount > 0)
      await supabase
        .from("cashflow")
        .insert({
          type: "in",
          amount: cashflowAmount,
          source: "sale",
          reference_id: trxData.id,
        });
    alert(`Transaksi ${nomorTransaksi} berhasil!`);
    setCart([]);
    setShowPayment(false);
    setCashReceived("");
    setCustomerName("");
    ambilProduk();
    setProcessing(false);
  }

  const totalHarga = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );
  const totalItem = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex h-full bg-bg">
      {/* PRODUK LIST */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <PageHeader title="Kasir" />

        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-card text-sm text-text outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-text-muted/50"
          />
        </div>

        {loading ? (
          <p className="text-sm text-text-muted">Memuat produk...</p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2.5 mb-4">
              {["Semua", "Sembako", "Makanan", "Minuman", "Snack"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="inline-flex items-center gap-2 bg-bg border border-border rounded-full px-4 py-2 text-xs font-medium text-text-muted hover:border-accent/50 hover:text-accent transition-all"
                >
                  <Package className="w-3 h-3" />
                  {cat}
                </button>
              ))}
            </div>
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => tambahKeCart(p)}
                className="bg-card border border-border rounded-xl p-5 flex justify-between items-center gap-5 cursor-pointer text-left transition-all shadow-sm hover:shadow-md hover:border-accent/40 active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold text-text">{p.name}</div>
                  <div className="text-xs text-text-muted mt-2 tabular-nums">
                    {p.stock < 5 ? (
                      <span className="inline-flex items-center gap-1 bg-danger-light text-danger px-2.5 py-1 rounded-full text-[10px] font-medium">
                        Stok: {p.stock}
                      </span>
                    ) : (
                      <span>Stok: {p.stock}</span>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold text-accent tabular-nums flex-shrink-0">
                  Rp {p.price.toLocaleString("id-ID")}
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && !loading && (
              <EmptyState message="Produk tidak ditemukan" />
            )}
          </div>
        )}
      </div>

      {/* CART PANEL */}
      <div className="w-[320px] bg-card border-l border-border flex flex-col flex-shrink-0">
        {/* Cart Header */}
        <div className="px-5 py-5 border-b-2 border-border flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-4 h-4 text-text" />
            <span className="text-[15px] font-bold text-text">Keranjang</span>
            {totalItem > 0 && (
              <span className="bg-accent text-accent-text rounded-full w-5 h-5 text-[11px] font-bold inline-flex items-center justify-center tabular-nums">
                {totalItem}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => {
                setCart([]);
                setShowPayment(false);
                setCashReceived("");
              }}
              className="text-xs text-danger bg-none border-none cursor-pointer hover:opacity-80"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted text-center">
              <ShoppingCart className="w-9 h-9 text-text-muted/30 mb-3" />
              <div className="text-[13px]">Keranjang kosong</div>
              <div className="text-[11px] mt-1.5 opacity-70">
                Pilih produk di samping
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center gap-3 py-3.5 border-b border-border last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-text truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-text-muted tabular-nums">
                      Rp {item.product.price.toLocaleString("id-ID")} × {item.qty}
                    </div>
                  </div>
                  <div className="text-[13px] font-semibold text-text tabular-nums flex-shrink-0">
                    Rp {(item.product.price * item.qty).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="px-5 py-5 border-t border-border">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-text-muted">Total Item</span>
            <span className="text-xs text-text-muted tabular-nums">{totalItem}</span>
          </div>
          <div className="flex justify-between items-baseline gap-3 mb-5">
            <span className="text-[13px] text-text-muted">Total</span>
            <span className="text-[22px] font-bold text-accent tabular-nums">
              Rp {totalHarga.toLocaleString("id-ID")}
            </span>
          </div>

          {!showPayment ? (
            <Button
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
              className="w-full shadow-md"
            >
              Bayar
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Uang diterima"
                autoFocus
                className="w-full h-12 px-4 rounded-lg border border-border text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-text-muted/50"
              />

              <button
                onClick={() => setCashReceived("0")}
                className="text-xs text-danger bg-none border-none cursor-pointer text-left"
              >
                Bon Semua (Belum Bayar)
              </button>

              {cashReceived !== "" && (
                <div
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    parseFloat(cashReceived) >= totalHarga
                      ? "bg-[#E8FFF5] text-[#1A7A50]"
                      : "bg-danger-light text-danger"
                  }`}
                >
                  {parseFloat(cashReceived) >= totalHarga
                    ? `Kembalian: Rp ${(parseFloat(cashReceived) - totalHarga).toLocaleString("id-ID")}`
                    : `Kurang: Rp ${(totalHarga - parseFloat(cashReceived)).toLocaleString("id-ID")}`}
                </div>
              )}

              {cashReceived !== "" && parseFloat(cashReceived) < totalHarga && (
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama pelanggan (bon)"
                  className="w-full h-12 px-4 rounded-lg border border-border text-[13px] text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-text-muted/50"
                />
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPayment(false);
                    setCashReceived("");
                    setCustomerName("");
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  disabled={processing || cashReceived === ""}
                  onClick={bayar}
                  loading={processing}
                  className="flex-1"
                >
                  Konfirmasi
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
