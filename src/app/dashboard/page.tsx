"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageHeader, LoadingState } from "@/app/components/ui";

type Summary = {
  omsetHariIni: number;
  pengeluaranHariIni: number;
  kasBersihHariIni: number;
  totalTransaksiHariIni: number;
  totalHutang: number;
  cashTotal: number;
  stockValue: number;
  piutangTotal: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  async function ambilRingkasan() {
    setLoading(true);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Cashflow hari ini
    const { data: cashflowToday } = await supabase
      .from("cashflow")
      .select("type, amount, source")
      .eq("status", "completed")
      .gte("created_at", startOfDay.toISOString());

    if (!cashflowToday) {
      setLoading(false);
      return;
    }

    const omsetHariIni = cashflowToday
      .filter((c) => c.source === "sale")
      .reduce((sum, c) => sum + c.amount, 0);

    const pengeluaranHariIni = cashflowToday
      .filter((c) => c.type === "out")
      .reduce((sum, c) => sum + c.amount, 0);

    const pemasukanHariIni = cashflowToday
      .filter((c) => c.type === "in")
      .reduce((sum, c) => sum + c.amount, 0);

    const kasBersihHariIni = pemasukanHariIni - pengeluaranHariIni;

    // 2. Total transaksi hari ini
    const { count: totalTransaksiHariIni } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", startOfDay.toISOString());

    // 3. Total hutang
    const { data: customers } = await supabase
      .from("customers")
      .select("total_debt")
      .eq("archived", false);

    const totalHutang = customers?.reduce((sum, c) => sum + c.total_debt, 0) ?? 0;

    // 4. Cash total (semua waktu)
    const { data: allCashflow } = await supabase
      .from("cashflow")
      .select("type, amount")
      .eq("status", "completed");

    const cashIn = (allCashflow ?? [])
      .filter((c) => c.type === "in")
      .reduce((sum, c) => sum + c.amount, 0);
    const cashOut = (allCashflow ?? [])
      .filter((c) => c.type === "out")
      .reduce((sum, c) => sum + c.amount, 0);
    const cashTotal = cashIn - cashOut;

    // 5. Nilai stok
    const { data: allProducts } = await supabase
      .from("products")
      .select("stock, last_cost");

    const stockValue = (allProducts ?? []).reduce(
      (sum, p) => sum + p.stock * (p.last_cost ?? 0),
      0,
    );

    setSummary({
      omsetHariIni,
      pengeluaranHariIni,
      kasBersihHariIni,
      totalTransaksiHariIni: totalTransaksiHariIni ?? 0,
      totalHutang,
      cashTotal,
      stockValue,
      piutangTotal: totalHutang,
    });

    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilRingkasan();
  }, []);

  if (loading || !summary) {
    return <main className="p-6 md:p-10"><LoadingState message="Memuat dashboard..." /></main>;
  }

  const kekayaanWarung =
    summary.cashTotal + summary.stockValue + summary.piutangTotal;

  const formatTanggal = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="p-6 md:p-10">
      <div className="mb-5">
        <p className="text-sm text-text-muted">Selamat pagi, Warung Mama 👋</p>
        <p className="text-xs text-text-muted/70 mt-1">{formatTanggal(new Date())}</p>
      </div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="p-7 rounded-xl shadow-sm min-h-[132px] flex flex-col justify-between">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed">Omset Hari Ini</div>
          <div className="text-2xl font-bold text-accent mt-4 tabular-nums">
            Rp {summary.omsetHariIni.toLocaleString("id-ID")}
          </div>
        </Card>
        <Card className="p-7 rounded-xl shadow-sm min-h-[132px] flex flex-col justify-between">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed">Pengeluaran</div>
          <div className="text-2xl font-bold text-danger mt-4 tabular-nums">
            Rp {summary.pengeluaranHariIni.toLocaleString("id-ID")}
          </div>
        </Card>
        <Card className="p-7 rounded-xl shadow-sm min-h-[132px] flex flex-col justify-between">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed">Kas Bersih</div>
          <div className="text-2xl font-bold text-text mt-4 tabular-nums">
            Rp {summary.kasBersihHariIni.toLocaleString("id-ID")}
          </div>
        </Card>
        <Card className="p-7 rounded-xl shadow-sm min-h-[132px] flex flex-col justify-between">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed">Total Transaksi</div>
          <div className="text-2xl font-bold text-text mt-4 tabular-nums">
            {summary.totalTransaksiHariIni}
          </div>
        </Card>
      </div>

      <Card className="p-7 rounded-xl shadow-sm mb-10">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider leading-relaxed">Total Hutang Pelanggan</div>
        <div className="text-2xl font-bold text-danger mt-4 tabular-nums">
          Rp {summary.totalHutang.toLocaleString("id-ID")}
        </div>
      </Card>

      <Card className="p-8 md:p-10 rounded-xl shadow-lg bg-gradient-to-br from-card to-bg max-w-3xl mx-auto">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 text-center">Kekayaan Warung</div>
        <div className="text-4xl font-black text-accent tabular-nums mb-8 text-center">
          Rp {kekayaanWarung.toLocaleString("id-ID")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-card border border-border rounded-lg p-5 text-center min-w-[120px]">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Cash</div>
            <div className="text-sm font-bold text-text tabular-nums mt-2">
              Rp {summary.cashTotal.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center min-w-[120px]">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Stok</div>
            <div className="text-sm font-bold text-text tabular-nums mt-2">
              Rp {summary.stockValue.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 text-center min-w-[120px]">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Piutang</div>
            <div className="text-sm font-bold text-text tabular-nums mt-2">
              Rp {summary.piutangTotal.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
