"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Bon Pelanggan</h1>

      <input
        type="text"
        placeholder="Cari nama / HP / catatan..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada pelanggan</p>
      ) : (
        <ul className="space-y-2">
          {filteredCustomers.map((c) => (
            <li key={c.id} className="border rounded-lg p-3">
              <Link
                href={`/bon/${c.id}`}
                className="border rounded-lg p-3 flex justify-between items-center block hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  {c.phone && (
                    <div className="text-sm text-gray-500">{c.phone}</div>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      c.total_debt > 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    Rp {c.total_debt.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-gray-400">
                    {c.total_debt > 0 ? "Aktif" : "Lunas"}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
