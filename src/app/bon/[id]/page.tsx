"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, PageHeader, Badge, LoadingState, EmptyState } from "@/app/components/ui";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

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

  const ambilData = useCallback(async () => {
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
  }, [customerId]);

  useEffect(() => {
    ambilData();
  }, [ambilData]);

  if (loading) return <main className="p-6 md:p-10"><LoadingState message="Memuat..." /></main>;
  if (!customer) return <main className="p-6 md:p-10"><p className="text-text-muted text-sm">Pelanggan tidak ditemukan</p></main>;

  return (
    <main className="p-6 md:p-10">
      <PageHeader title={customer.name} description={customer.phone ?? undefined} backHref="/bon" backLabel="Kembali ke Daftar Bon" />

      <Card className="mb-8 text-center p-8 rounded-xl shadow-sm bg-gradient-to-br from-card to-bg">
        <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total Hutang</div>
        <div className={`text-2xl font-bold mt-4 tabular-nums ${
          customer.total_debt > 0 ? "text-danger" : "text-accent"
        }`}>
          Rp {customer.total_debt.toLocaleString("id-ID")}
        </div>
        <Badge variant={customer.total_debt > 0 ? "danger" : "success"} className="mt-3">
          {customer.total_debt > 0 ? "Belum Lunas" : "Lunas"}
        </Badge>
      </Card>

      {customer.total_debt > 0 && !showPayForm && (
        <Button onClick={() => setShowPayForm(true)} className="w-full max-w-md mb-8">
          Bayar Hutang
        </Button>
      )}

      {showPayForm && (
        <Card className="mb-8 max-w-md">
          <Input
            label={`Nominal Pembayaran (maks Rp ${customer.total_debt.toLocaleString("id-ID")})`}
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
            className="mb-5"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowPayForm(false);
                setPayAmount("");
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              disabled={processing || payAmount === ""}
              onClick={bayarHutang}
              loading={processing}
              className="flex-1"
            >
              Konfirmasi
            </Button>
          </div>
        </Card>
      )}

      <h2 className="font-semibold text-text text-sm mb-5">Riwayat</h2>
      {debts.length === 0 ? (
        <EmptyState message="Belum ada riwayat" />
      ) : (
        <div className="space-y-4 max-w-xl">
          {debts.map((d) => (
            <Card key={d.id} variant="hoverable" className="flex justify-between items-center gap-5 text-sm">
              <div className="flex items-center gap-4">
                {d.type === "charge" ? (
                  <ArrowUpCircle className="w-5 h-5 text-danger" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-accent" />
                )}
                <div>
                  <div className="font-medium text-text">
                    {d.type === "charge" ? "Bon Baru" : "Pembayaran"}
                  </div>
                  <div className="text-text-muted text-[10px] mt-1.5">
                    {new Date(d.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
              <div className={`font-semibold tabular-nums flex-shrink-0 ${
                d.type === "charge" ? "text-danger" : "text-accent"
              }`}>
                {d.type === "charge" ? "+" : "-"}Rp {d.amount.toLocaleString("id-ID")}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
