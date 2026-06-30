"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Expense = {
  id: number;
  amount: number;
  source: string;
  status: string;
  note: string | null;
  created_at: string;
};

export default function PengeluaranPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function ambilPengeluaran() {
    setLoading(true);
    const { data, error } = await supabase
      .from("cashflow")
      .select("*")
      .eq("source", "operational_expense")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setExpenses(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilPengeluaran();
  }, []);

  async function simpanPengeluaran() {
    if (amount === "" || note.trim() === "") {
      alert("Nominal dan catatan wajib diisi");
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      alert("Nominal harus lebih dari 0");
      return;
    }

    setProcessing(true);

    const { error } = await supabase.from("cashflow").insert({
      type: "out",
      amount: amountValue,
      source: "operational_expense",
      note: note.trim(),
    });

    if (error) {
      console.error(error);
      alert("Gagal menyimpan pengeluaran");
      setProcessing(false);
      return;
    }

    alert("Pengeluaran berhasil dicatat!");
    setAmount("");
    setNote("");
    ambilPengeluaran();
    setProcessing(false);
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Pengeluaran Manual</h1>
      <p className="text-xs text-gray-500 mb-4">
        Untuk pengeluaran non-stok seperti listrik, plastik, transport, dll.
      </p>

      <div className="border rounded-lg p-4 space-y-3 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nominal (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Kategori / Catatan
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Listrik, Plastik, Transport"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          disabled={processing}
          onClick={simpanPengeluaran}
          className="w-full bg-green-700 text-white rounded py-2 font-medium disabled:opacity-40"
        >
          {processing ? "Memproses..." : "Catat Pengeluaran"}
        </button>
      </div>

      <h2 className="font-medium mb-2">Riwayat Pengeluaran</h2>
      {loading ? (
        <p>Memuat...</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada pengeluaran</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((e) => (
            <li
              key={e.id}
              className={`border rounded-lg p-3 flex justify-between text-sm ${
                e.status === "void" ? "opacity-50" : ""
              }`}
            >
              <div>
                <div className="font-medium">{e.note}</div>
                <div className="text-gray-400 text-xs">
                  {new Date(e.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-red-600 font-medium">
                -Rp {e.amount.toLocaleString("id-ID")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
