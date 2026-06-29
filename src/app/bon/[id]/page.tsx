"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  total_debt: number;
};

type Debt = {
  id: number;
  amount: number;
  type: string;
  created_at: string;
};

export default function DetailPelangganPage() {
  const params = useParams();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  async function bayarHutang() {
    if (!customer) return;

    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Nominal tidak valid");
      return;
    }

    if (amount > customer.total_debt) {
      alert("Nominal melebihi total hutang");
      return;
    }

    setProcessing(true);

    // 1. Insert ke debts sebagai payment
    const { error: debtError } = await supabase.from("debts").insert({
      customer_id: customer.id,
      amount: amount,
      type: "payment",
    });

    if (debtError) {
      console.error(debtError);
      alert("Gagal menyimpan pembayaran");
      setProcessing(false);
      return;
    }

    // 2. Update total_debt customer
    const newTotalDebt = customer.total_debt - amount;
    const { error: customerError } = await supabase
      .from("customers")
      .update({ total_debt: newTotalDebt })
      .eq("id", customer.id);

    if (customerError) {
      console.error(customerError);
      alert("Gagal mengupdate total hutang");
      setProcessing(false);
      return;
    }

    // 3. Catat ke cashflow (uang pembayaran bon masuk ke laci)
    const { error: cashflowError } = await supabase.from("cashflow").insert({
      type: "in",
      amount: amount,
      source: "debt_payment",
      reference_id: customer.id,
    });

    if (cashflowError) {
      console.error(cashflowError);
      alert("Gagal mencatat cashflow");
      setProcessing(false);
      return;
    }

    alert("Pembayaran berhasil!");
    setShowPayForm(false);
    setPayAmount("");
    setProcessing(false);
    ambilData();
  }

  async function ambilData() {
    setLoading(true);

    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError || !customerData) {
      console.error(customerError);
      setLoading(false);
      return;
    }
    setCustomer(customerData);

    const { data: debtsData, error: debtsError } = await supabase
      .from("debts")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (debtsError) {
      console.error(debtsError);
      setLoading(false);
      return;
    }
    setDebts(debtsData);
    setLoading(false);
  }

  useEffect(() => {
    ambilData();
  }, [customerId]);

  if (loading) return <main className="p-6">Memuat...</main>;
  if (!customer) return <main className="p-6">Pelanggan tidak ditemukan</main>;

  return (
    <main className="p-6 max-w-md mx-auto">
      <Link href="/bon" className="text-sm text-blue-600">
        ← Kembali
      </Link>

      <h1 className="text-xl font-bold mt-2">{customer.name}</h1>
      {customer.phone && (
        <p className="text-sm text-gray-500">{customer.phone}</p>
      )}

      <div className="border rounded-lg p-4 my-4 text-center">
        <div className="text-sm text-gray-500">Total Hutang</div>
        <div
          className={`text-2xl font-bold ${
            customer.total_debt > 0 ? "text-red-600" : "text-green-700"
          }`}
        >
          Rp {customer.total_debt.toLocaleString("id-ID")}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {customer.total_debt > 0 ? "Aktif" : "Lunas"}
        </div>
      </div>

      {customer.total_debt > 0 && !showPayForm && (
        <button
          onClick={() => setShowPayForm(true)}
          className="w-full bg-green-700 text-white rounded py-2 font-medium mb-4"
        >
          Bayar Hutang
        </button>
      )}

      {showPayForm && (
        <div className="border rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium mb-1">
            Nominal Pembayaran (maks Rp{" "}
            {customer.total_debt.toLocaleString("id-ID")})
          </label>
          <input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
            className="w-full border rounded px-3 py-2 mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPayForm(false);
                setPayAmount("");
              }}
              className="flex-1 border rounded py-2 text-sm"
            >
              Batal
            </button>
            <button
              disabled={processing || payAmount === ""}
              onClick={bayarHutang}
              className="flex-1 bg-green-700 text-white rounded py-2 text-sm font-medium disabled:opacity-40"
            >
              {processing ? "Memproses..." : "Konfirmasi"}
            </button>
          </div>
        </div>
      )}
      <h2 className="font-medium mb-2">Riwayat</h2>
      {debts.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada riwayat</p>
      ) : (
        <ul className="space-y-2">
          {debts.map((d) => (
            <li
              key={d.id}
              className="border rounded-lg p-3 flex justify-between text-sm"
            >
              <div>
                <div className="font-medium">
                  {d.type === "charge" ? "Bon Baru" : "Pembayaran"}
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(d.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <div
                className={
                  d.type === "charge" ? "text-red-600" : "text-green-700"
                }
              >
                {d.type === "charge" ? "+" : "-"}Rp{" "}
                {d.amount.toLocaleString("id-ID")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
