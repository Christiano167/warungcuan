"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, PageHeader, LoadingState, EmptyState } from "@/app/components/ui";
import { Pencil } from "lucide-react";

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
    <main className="p-6 md:p-8">
      <PageHeader title="Manajemen Produk" />

      <div className="bg-card border border-border rounded-[10px] p-6 mb-8 space-y-4 shadow-sm max-w-md">
        <Input
          type="text"
          placeholder="Nama produk"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Harga"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Stok awal (opsional)"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <Button onClick={tambahProduk} className="w-full">
          Tambah Produk
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Memuat produk..." />
      ) : products.length === 0 ? (
        <EmptyState message="Belum ada produk" submessage="Tambah produk pertama Anda" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <Card key={p.id} variant="hoverable">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <div className="font-medium text-text truncate">{p.name}</div>
                  <div className="text-xs text-text-muted mt-1 tabular-nums">Stok: {p.stock}</div>
                </div>

                {editingId === p.id ? (
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 bg-card border border-border text-text rounded px-2 py-1 text-sm text-right outline-none focus:border-accent"
                    />
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => simpanHargaBaru(p.id)}
                        className="text-accent font-semibold hover:opacity-80 cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button onClick={batalEdit} className="text-text-muted hover:text-text cursor-pointer">
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-text tabular-nums">
                      Rp {p.price.toLocaleString("id-ID")}
                    </div>
                    <button
                      onClick={() => mulaiEdit(p)}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:opacity-85 font-medium mt-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Harga
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
