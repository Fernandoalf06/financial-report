"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/lib/types";
import { useTransactions } from "@/contexts/TransactionContext";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Granularity = "daily" | "weekly" | "monthly" | "yearly";

interface Preset {
  label: string;
  shortLabel: string;
  days: number | null; // null = "all time"
  defaultGranularity: Granularity;
}

interface ChartPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

// ─── Presets ───────────────────────────────────────────────────────────────────
const PRESETS: Preset[] = [
  { label: "7 Hari",    shortLabel: "1W",  days: 7,    defaultGranularity: "daily"   },
  { label: "1 Bulan",   shortLabel: "1M",  days: 30,   defaultGranularity: "daily"   },
  { label: "3 Bulan",   shortLabel: "3M",  days: 91,   defaultGranularity: "weekly"  },
  { label: "6 Bulan",   shortLabel: "6M",  days: 182,  defaultGranularity: "monthly" },
  { label: "9 Bulan",   shortLabel: "9M",  days: 274,  defaultGranularity: "monthly" },
  { label: "1 Tahun",   shortLabel: "1Y",  days: 365,  defaultGranularity: "monthly" },
  { label: "2 Tahun",   shortLabel: "2Y",  days: 730,  defaultGranularity: "monthly" },
  { label: "Semua",     shortLabel: "All", days: null,  defaultGranularity: "yearly"  },
];

const GRANULARITIES: { key: Granularity; label: string }[] = [
  { key: "daily",   label: "Harian"   },
  { key: "weekly",  label: "Mingguan" },
  { key: "monthly", label: "Bulanan"  },
  { key: "yearly",  label: "Tahunan"  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatIDRShort(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000_000)     return `Rp ${(value / 1_000_000).toFixed(0)}jt`;
  if (Math.abs(value) >= 1_000)         return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

/** Returns a bucket key string + display label for a given date + granularity */
function getBucketKey(date: Date, granularity: Granularity): { key: string; label: string } {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-based
  const d = date.getDate();

  if (granularity === "yearly") {
    return { key: `${y}`, label: `${y}` };
  }

  if (granularity === "monthly") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return { key: `${y}-${String(m + 1).padStart(2, "0")}`, label: `${monthNames[m]} ${y}` };
  }

  if (granularity === "weekly") {
    // ISO week: start on Monday
    const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0, Sun=6
    const monday = new Date(date);
    monday.setDate(d - dayOfWeek);
    const sun = new Date(monday);
    sun.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) =>
      `${dt.getDate()} ${["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][dt.getMonth()]}`;
    return {
      key: monday.toISOString().split("T")[0],
      label: `${fmt(monday)} – ${fmt(sun)}`,
    };
  }

  // daily
  const monthShort = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][m];
  return {
    key: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    label: `${d} ${monthShort}`,
  };
}

/** Aggregate transactions into ChartPoints */
function aggregate(
  transactions: Transaction[],
  since: Date | null,
  granularity: Granularity
): ChartPoint[] {
  const buckets = new Map<string, { label: string; income: number; expense: number }>();

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (since && txDate < since) continue;

    const { key, label } = getBucketKey(txDate, granularity);
    if (!buckets.has(key)) {
      buckets.set(key, { label, income: 0, expense: 0 });
    }
    const b = buckets.get(key)!;
    if (tx.type === "income") b.income += tx.amount;
    else b.expense += tx.amount;
  }

  // Sort by key (lexicographic = chronological for ISO formats)
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({
      label: v.label,
      income: v.income,
      expense: v.expense,
      net: v.income - v.expense,
    }));
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 border border-white/10 rounded-xl p-3 shadow-2xl text-sm backdrop-blur-sm min-w-[180px]">
      <p className="text-slate-300 font-semibold mb-2 border-b border-white/10 pb-1.5">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span className="text-slate-400 text-xs">{entry.name}</span>
          </div>
          <span className={`font-semibold text-xs ${
            entry.dataKey === "income" ? "text-indigo-300"
            : entry.dataKey === "expense" ? "text-rose-300"
            : entry.value >= 0 ? "text-emerald-300" : "text-rose-300"
          }`}>
            {entry.dataKey === "net" && entry.value >= 0 ? "+" : ""}
            {formatIDRShort(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function TrendChart() {
  const { transactions } = useTransactions();
  const [presetIdx, setPresetIdx] = useState(3);          // default: 6 months
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [showNet, setShowNet] = useState(true);

  const preset = PRESETS[presetIdx];

  const since: Date | null = useMemo(() => {
    if (preset.days === null) return null;
    const d = new Date();
    d.setDate(d.getDate() - preset.days);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [preset.days]);

  const chartData = useMemo(
    () => aggregate(transactions, since, granularity),
    [transactions, since, granularity]
  );

  // Summary stats for the selected range
  const rangeStats = useMemo(() => {
    const income = chartData.reduce((s, d) => s + d.income, 0);
    const expense = chartData.reduce((s, d) => s + d.expense, 0);
    return { income, expense, net: income - expense };
  }, [chartData]);

  function handlePreset(idx: number) {
    setPresetIdx(idx);
    setGranularity(PRESETS[idx].defaultGranularity);
  }

  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 shadow-xl space-y-5">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Tren Keuangan</h3>
          <p className="text-slate-400 text-sm mt-0.5">
            {chartData.length === 0
              ? "Tidak ada data untuk periode ini"
              : `${chartData.length} periode · ${preset.label}`}
          </p>
        </div>

        {/* Range summary badges */}
        <div className="flex gap-3 text-xs shrink-0">
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-center">
            <p className="text-indigo-300 font-semibold">{formatIDRShort(rangeStats.income)}</p>
            <p className="text-slate-500 mt-0.5">Pemasukan</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-center">
            <p className="text-rose-300 font-semibold">{formatIDRShort(rangeStats.expense)}</p>
            <p className="text-slate-500 mt-0.5">Pengeluaran</p>
          </div>
          <div className={`rounded-lg px-3 py-1.5 text-center border ${
            rangeStats.net >= 0
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-rose-500/10 border-rose-500/20"
          }`}>
            <p className={`font-semibold ${rangeStats.net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {rangeStats.net >= 0 ? "+" : ""}{formatIDRShort(rangeStats.net)}
            </p>
            <p className="text-slate-500 mt-0.5">Net</p>
          </div>
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Preset pills */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          {PRESETS.map((p, i) => (
            <button
              key={p.shortLabel}
              type="button"
              onClick={() => handlePreset(i)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                i === presetIdx
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
              }`}
            >
              {p.shortLabel}
            </button>
          ))}
        </div>

        {/* Granularity tabs */}
        <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5 shrink-0">
          {GRANULARITIES.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGranularity(g.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                granularity === g.key
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Net toggle */}
        <button
          type="button"
          onClick={() => setShowNet((v) => !v)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
            showNet
              ? "bg-emerald-600/80 text-white"
              : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
          }`}
        >
          Net
        </button>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────── */}
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 text-sm">Tidak ada transaksi dalam periode ini</p>
            <p className="text-slate-600 text-xs mt-1">Coba pilih rentang waktu yang lebih panjang</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              tickFormatter={formatIDRShort}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-slate-300 text-xs">{value}</span>
              )}
            />
            <Bar dataKey="income"  name="Pemasukan"   fill="#6366f1" radius={[4,4,0,0]} maxBarSize={36} />
            <Bar dataKey="expense" name="Pengeluaran"  fill="#f43f5e" radius={[4,4,0,0]} maxBarSize={36} />
            {showNet && (
              <Line
                type="monotone"
                dataKey="net"
                name="Net"
                stroke="#10b981"
                strokeWidth={2}
                dot={chartData.length <= 12 ? { fill: "#10b981", r: 3 } : false}
                strokeDasharray="none"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
