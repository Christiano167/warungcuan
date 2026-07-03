"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, PageHeader, LoadingState, EmptyState } from "@/app/components/ui";

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
    <main className="p-6 md:p-8 max-w-2xl">
      <PageHeader
        title="Pengeluaran Manual"
        description="Untuk pengeluaran non-stok seperti listrik, plastik, transport, dll."
      />

      <div className="bg-card border border-border rounded-[10px] p-6 space-y-5 mb-8 max-w-md shadow-sm">
        <Input
          label="Nominal (Rp)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
        <Input
          label="Kategori / Catatan"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Listrik, Plastik, Transport"
        />
        <Button
          disabled={processing}
          onClick={simpanPengeluaran}
          loading={processing}
          className="w-full"
        >
          Catat Pengeluaran
        </Button>
      </div>

      <h2 className="font-semibold text-text text-sm mb-4">Riwayat Pengeluaran</h2>
      {loading ? (
        <LoadingState message="Memuat..." />
      ) : expenses.length === 0 ? (
        <EmptyState message="Belum ada pengeluaran" />
      ) : (
        <div className="space-y-3.5 max-w-xl">
          {expenses.map((e) => (
            <Card
              key={e.id}
              variant={e.status === "void" ? "default" : "hoverable"}
              className={`flex justify-between items-center text-sm ${
                e.status === "void" ? "opacity-50" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-text flex items-center gap-2">
                  {e.note}
                  {e.status === "void" && (
                    <span className="bg-danger-light text-danger text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Void</span>
                  )}
                </div>
                <div className="text-text-muted text-[10px] mt-1">
                  {new Date(e.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="text-danger font-bold text-sm tabular-nums flex-shrink-0 ml-3">
                -Rp {e.amount.toLocaleString("id-ID")}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
