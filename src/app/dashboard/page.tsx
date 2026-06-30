"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

    // 1. Cashflow hari ini (untuk omset, pengeluaran, kas bersih hari ini)
    const { data: cashflowToday, error: cashflowTodayError } = await supabase
      .from("cashflow")
      .select("type, amount, source")
      .eq("status", "completed")
      .gte("created_at", startOfDay.toISOString());

    if (cashflowTodayError) {
      console.error(cashflowTodayError);
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
    const { count: totalTransaksiHariIni, error: trxError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", startOfDay.toISOString());

    if (trxError) {
      console.error(trxError);
      setLoading(false);
      return;
    }

    // 3. Total hutang semua pelanggan
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("total_debt")
      .eq("archived", false);

    if (customersError) {
      console.error(customersError);
      setLoading(false);
      return;
    }

    const totalHutang = customers.reduce((sum, c) => sum + c.total_debt, 0);

    // 4. Cash total (SEMUA waktu, bukan cuma hari ini) - untuk Net Worth
    const { data: allCashflow, error: allCashflowError } = await supabase
      .from("cashflow")
      .select("type, amount")
      .eq("status", "completed");

    if (allCashflowError) {
      console.error(allCashflowError);
      setLoading(false);
      return;
    }

    const cashIn = allCashflow
      .filter((c) => c.type === "in")
      .reduce((sum, c) => sum + c.amount, 0);
    const cashOut = allCashflow
      .filter((c) => c.type === "out")
      .reduce((sum, c) => sum + c.amount, 0);
    const cashTotal = cashIn - cashOut;

    // 5. Nilai stok (Stock × lastCost) - untuk Net Worth
    const { data: allProducts, error: productsError } = await supabase
      .from("products")
      .select("stock, last_cost");

    if (productsError) {
      console.error(productsError);
      setLoading(false);
      return;
    }

    const stockValue = allProducts.reduce(
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
    return <main className="p-6">Memuat dashboard...</main>;
  }

  const kekayaanWarung =
    summary.cashTotal + summary.stockValue + summary.piutangTotal;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">Omset Hari Ini</div>
          <div className="text-lg font-bold text-green-700">
            Rp {summary.omsetHariIni.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">Pengeluaran</div>
          <div className="text-lg font-bold text-red-600">
            Rp {summary.pengeluaranHariIni.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">Kas Bersih</div>
          <div className="text-lg font-bold">
            Rp {summary.kasBersihHariIni.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-xs text-gray-500">Total Transaksi</div>
          <div className="text-lg font-bold">
            {summary.totalTransaksiHariIni}
          </div>
        </div>
        <div className="border rounded-lg p-3 col-span-2">
          <div className="text-xs text-gray-500">Total Hutang Pelanggan</div>
          <div className="text-lg font-bold text-red-600">
            Rp {summary.totalHutang.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="border-2 border-green-700 rounded-lg p-4 text-center">
        <div className="text-sm text-gray-500 mb-1">Kekayaan Warung</div>
        <div className="text-2xl font-bold text-green-700">
          Rp {kekayaanWarung.toLocaleString("id-ID")}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Cash: Rp {summary.cashTotal.toLocaleString("id-ID")} + Stok: Rp{" "}
          {summary.stockValue.toLocaleString("id-ID")} + Piutang: Rp{" "}
          {summary.piutangTotal.toLocaleString("id-ID")}
        </div>
      </div>
    </main>
  );
}
