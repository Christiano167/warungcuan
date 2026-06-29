"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string | null;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    ambilProduk();
  }, []);

  async function ambilProduk() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setProducts(data);
    setLoading(false);
  }

  async function tambahProduk() {
    if (name.trim() === "" || price === "") {
      alert("Nama dan harga wajib diisi");
      return;
    }

    const stockValue = stock === "" ? 0 : parseInt(stock);
    if (stockValue < 0) {
      alert("Stok tidak boleh negatif");
      return;
    }

    const { error } = await supabase.from("products").insert({
      name: name,
      price: parseFloat(price),
      stock: stockValue,
    });

    if (error) {
      console.error(error);
      alert("Gagal menambah produk");
      return;
    }

    setName("");
    setPrice("");
    setStock("");
    ambilProduk();
  }

  function mulaiEdit(product: Product) {
    setEditingId(product.id);
    setEditPrice(product.price.toString());
  }

  function batalEdit() {
    setEditingId(null);
    setEditPrice("");
  }

  async function simpanHargaBaru(id: number) {
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Harga tidak valid");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Gagal mengubah harga");
      return;
    }

    setEditingId(null);
    setEditPrice("");
    ambilProduk();
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Manajemen Produk</h1>

      <div className="border rounded-lg p-4 mb-6 space-y-2">
        <input
          type="text"
          placeholder="Nama produk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Harga"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Stok awal (opsional)"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button
          onClick={tambahProduk}
          className="w-full bg-green-700 text-white rounded py-2 font-medium"
        >
          Tambah Produk
        </button>
      </div>

      {loading ? (
        <p>Memuat produk...</p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">Stok: {p.stock}</div>
                </div>

                {editingId === p.id ? (
                  <div className="flex flex-col items-end gap-1">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-right"
                    />
                    <div className="flex gap-2 text-sm">
                      <button
                        onClick={() => simpanHargaBaru(p.id)}
                        className="text-green-700 font-medium"
                      >
                        Simpan
                      </button>
                      <button onClick={batalEdit} className="text-gray-500">
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="font-semibold">
                      Rp {p.price.toLocaleString("id-ID")}
                    </div>
                    <button
                      onClick={() => mulaiEdit(p)}
                      className="text-sm text-blue-600"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
