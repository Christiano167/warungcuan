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
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
    <div style={{ display: "flex", height: "100%", background: "var(--bg)" }}>
      {/* PRODUK */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "14px",
          }}
        >
          Kasir
        </h1>

        <input
          type="text"
          placeholder="Cari produk..."
          style={{
            width: "100%",
            height: "40px",
            padding: "0 14px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            fontSize: "14px",
            color: "var(--text)",
            boxSizing: "border-box",
            outline: "none",
            marginBottom: "12px",
          }}
        />

        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Memuat produk...
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => tambahKeCart(p)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.1s",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text)",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                    }}
                  >
                    Stok: {p.stock}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  Rp {p.price.toLocaleString("id-ID")}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CART PANEL */}
      <div
        style={{
          width: "280px",
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Cart Header */}
        <div
          style={{
            padding: "20px 16px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)" }}
          >
            Keranjang{" "}
            {totalItem > 0 && (
              <span
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "6px",
                }}
              >
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
              style={{
                fontSize: "12px",
                color: "var(--danger)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {cart.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "32px", opacity: 0.3, marginBottom: "8px" }}
              >
                🛒
              </div>
              <div style={{ fontSize: "13px" }}>Keranjang kosong</div>
              <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
                Pilih produk di samping
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      {item.product.name}
                    </div>
                    <div
                      style={{ fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      Rp {item.product.price.toLocaleString("id-ID")} ×{" "}
                      {item.qty}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Rp {(item.product.price * item.qty).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div
          style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Total Item
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {totalItem}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "14px",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Total
            </span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              Rp {totalHarga.toLocaleString("id-ID")}
            </span>
          </div>

          {!showPayment ? (
            <button
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
              style={{
                width: "100%",
                height: "44px",
                background:
                  cart.length === 0 ? "var(--border)" : "var(--accent)",
                color:
                  cart.length === 0
                    ? "var(--text-muted)"
                    : "var(--accent-text)",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Bayar
            </button>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Uang diterima"
                autoFocus
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  fontSize: "14px",
                  color: "var(--text)",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              <button
                onClick={() => setCashReceived("0")}
                style={{
                  fontSize: "12px",
                  color: "var(--danger)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Bon Semua (Belum Bayar)
              </button>

              {cashReceived !== "" && (
                <div
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background:
                      parseFloat(cashReceived) >= totalHarga
                        ? "#E8FFF5"
                        : "var(--danger-light)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color:
                      parseFloat(cashReceived) >= totalHarga
                        ? "#1A7A50"
                        : "var(--danger)",
                  }}
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
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                    color: "var(--text)",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setCashReceived("");
                    setCustomerName("");
                  }}
                  style={{
                    flex: 1,
                    height: "40px",
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "var(--text)",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  disabled={processing || cashReceived === ""}
                  onClick={bayar}
                  style={{
                    flex: 1,
                    height: "40px",
                    background:
                      processing || cashReceived === ""
                        ? "var(--border)"
                        : "var(--accent)",
                    color:
                      processing || cashReceived === ""
                        ? "var(--text-muted)"
                        : "var(--accent-text)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor:
                      processing || cashReceived === ""
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {processing ? "Proses..." : "Konfirmasi"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
