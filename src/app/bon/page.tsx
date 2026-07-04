"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Card, PageHeader, LoadingState, EmptyState, Badge } from "@/app/components/ui";
import { Search } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  note: string | null;
  total_debt: number;
};

export default function BonPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const ambilPelanggan = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setCustomers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    ambilPelanggan();
  }, [ambilPelanggan]);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.note?.toLowerCase().includes(term)
    );
  });

  return (
    <main className="p-6 md:p-10">
      <PageHeader title="Bon Pelanggan" />

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
        <input
          type="text"
          placeholder="Cari nama / HP / catatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-card text-sm text-text outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-text-muted/50"
        />
      </div>

      {loading ? (
        <LoadingState message="Memuat data..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState message="Tidak ada pelanggan ditemukan" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((c) => (
            <Link key={c.id} href={`/bon/${c.id}`} className="no-underline">
              <Card variant="hoverable" className="flex justify-between items-center gap-5">
                <div className="min-w-0">
                  <div className="font-medium text-text">{c.name}</div>
                  {c.phone ? (
                    <div className="text-xs text-text-muted mt-2">{c.phone}</div>
                  ) : (
                    <div className="text-xs text-text-muted/40 mt-2">Tidak ada nomor HP</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold tabular-nums ${
                    c.total_debt > 0 ? "text-danger" : "text-accent"
                  }`}>
                    Rp {c.total_debt.toLocaleString("id-ID")}
                  </div>
                  <Badge variant={c.total_debt > 0 ? "danger" : "success"} className="mt-2">
                    {c.total_debt > 0 ? "Aktif" : "Lunas"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
