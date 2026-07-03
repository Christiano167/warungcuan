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
    return <main className="p-6"><LoadingState message="Memuat dashboard..." /></main>;
  }

  const kekayaanWarung =
    summary.cashTotal + summary.stockValue + summary.piutangTotal;

  return (
    <main className="p-6 md:p-8 max-w-4xl">
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Omset Hari Ini</div>
          <div className="text-lg font-bold text-accent mt-1 tabular-nums">
            Rp {summary.omsetHariIni.toLocaleString("id-ID")}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Pengeluaran</div>
          <div className="text-lg font-bold text-danger mt-1 tabular-nums">
            Rp {summary.pengeluaranHariIni.toLocaleString("id-ID")}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Kas Bersih</div>
          <div className="text-lg font-bold text-text mt-1 tabular-nums">
            Rp {summary.kasBersihHariIni.toLocaleString("id-ID")}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Transaksi</div>
          <div className="text-lg font-bold text-text mt-1 tabular-nums">
            {summary.totalTransaksiHariIni}
          </div>
        </Card>
        <Card className="sm:col-span-2">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Total Hutang Pelanggan</div>
          <div className="text-lg font-bold text-danger mt-1 tabular-nums">
            Rp {summary.totalHutang.toLocaleString("id-ID")}
          </div>
        </Card>
      </div>

      <Card variant="highlight" className="max-w-2xl text-center">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Kekayaan Warung</div>
        <div className="text-2xl font-bold text-accent tabular-nums">
          Rp {kekayaanWarung.toLocaleString("id-ID")}
        </div>
        <div className="text-xs text-text-muted mt-4 pt-4 border-t border-border/60">
          <span className="inline-block mx-2">Cash: <strong className="text-text tabular-nums">Rp {summary.cashTotal.toLocaleString("id-ID")}</strong></span>
          <span className="inline-block mx-1 text-text-muted/40">•</span>
          <span className="inline-block mx-2">Stok: <strong className="text-text tabular-nums">Rp {summary.stockValue.toLocaleString("id-ID")}</strong></span>
          <span className="inline-block mx-1 text-text-muted/40">•</span>
          <span className="inline-block mx-2">Piutang: <strong className="text-text tabular-nums">Rp {summary.piutangTotal.toLocaleString("id-ID")}</strong></span>
        </div>
      </Card>
    </main>
  );
}
