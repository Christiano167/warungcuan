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
              className="w-full bg-green-700 text-white rounded py-2 font-medium disabled:opacity-40"
            >
              Bayar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
