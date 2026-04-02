"use client";

import { useTransactions } from "@/contexts/TransactionContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";

export default function AnalyticsPageClient() {
  const { transactions } = useTransactions();

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ─── 1. YoY Comparison Data ──────────────────────────────────────────────────
  const yoyData = useMemo(() => {
    const dataByMonth: Record<string, { monthDate: string; m: string, thisYearInc: number, thisYearExp: number, lastYearInc: number, lastYearExp: number }> = {};
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const y = d.getFullYear();
      if (y !== currentYear && y !== lastYear) return;

      const m = d.toLocaleDateString("id-ID", { month: "short" });
      const monthIndex = String(d.getMonth()).padStart(2, "0");

      if (!dataByMonth[monthIndex]) {
        dataByMonth[monthIndex] = { monthDate: monthIndex, m, thisYearInc: 0, thisYearExp: 0, lastYearInc: 0, lastYearExp: 0 };
      }

      if (y === currentYear) {
        if (tx.type === "income") dataByMonth[monthIndex].thisYearInc += tx.amount;
        else dataByMonth[monthIndex].thisYearExp += tx.amount;
      } else {
        if (tx.type === "income") dataByMonth[monthIndex].lastYearInc += tx.amount;
        else dataByMonth[monthIndex].lastYearExp += tx.amount;
      }
    });

    return Object.values(dataByMonth).sort((a, b) => a.monthDate.localeCompare(b.monthDate));
  }, [transactions]);

  // ─── 2. Cash Flow Prediction (Simple Moving Average 3-Mo) ───────────────────
  // We calculate net cash flow per month, then average the last 3 months to project next month
  const projection = useMemo(() => {
    const flowByMonth: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!flowByMonth[key]) flowByMonth[key] = 0;
      flowByMonth[key] += tx.type === "income" ? tx.amount : -tx.amount;
    });

    const entries = Object.entries(flowByMonth).sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length === 0) return { projectedNet: 0, text: "Data tidak cukup." };
    
    const last3 = entries.slice(-3).map(e => e[1]);
    const avg = last3.reduce((a, b) => a + b, 0) / (last3.length || 1);
    
    let text = "";
    if (avg > 0) text = `Diperkirakan kas Anda akan bertambah sebesar ${formatIDR(avg)} di bulan berikutnya menurut rata-rata 3 bulan terakhir.`;
    else if (avg < 0) text = `Diperkirakan kas Anda akan menyusut sebesar ${formatIDR(Math.abs(avg))} di bulan berikutnya. Lakukan efisiensi pengeluaran.`;
    else text = "Arus kas diproyeksikan stabil.";

    return { projectedNet: avg, text };
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          Analitik Lanjutan
        </h1>
        <p className="text-slate-400 mt-1">
          Bandingkan performa keuangaan lintas tahun dan proyeksikan tren mendatang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 border-indigo-500 text-white md:col-span-1 shadow-lg shadow-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white/80 text-sm font-normal flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Proyeksi Arus Kas (Bulan Depan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {projection.projectedNet >= 0 ? "+" : "-"}{formatIDR(Math.abs(projection.projectedNet))}
            </div>
            <p className="text-indigo-200 text-sm mt-3 opacity-90 leading-relaxed">
              {projection.text}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YoY Income */}
        <Card className="bg-slate-800/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg flex gap-2">
               <BarChart3 className="text-emerald-400 w-5 h-5" />
               Perbandingan Pemasukan (YoY)
            </CardTitle>
            <CardDescription className="text-slate-400">Pemasukan Tahun Ini vs Tahun Lalu</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {yoyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Belum ada data transaksi</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="m" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v / 1000000}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                    itemStyle={{ color: "#f8fafc" }}
                    formatter={(val: any) => formatIDR(val as number)}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar name="Tahun Ini" dataKey="thisYearInc" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar name="Tahun Lalu" dataKey="lastYearInc" fill="#059669" opacity={0.5} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* YoY Expense */}
        <Card className="bg-slate-800/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg flex gap-2">
               <BarChart3 className="text-rose-400 w-5 h-5" />
               Perbandingan Pengeluaran (YoY)
            </CardTitle>
            <CardDescription className="text-slate-400">Pengeluaran Tahun Ini vs Tahun Lalu</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {yoyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Belum ada data transaksi</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="m" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v / 1000000}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                    itemStyle={{ color: "#f8fafc" }}
                    formatter={(val: any) => formatIDR(val as number)}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar name="Tahun Ini" dataKey="thisYearExp" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar name="Tahun Lalu" dataKey="lastYearExp" fill="#be123c" opacity={0.5} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
