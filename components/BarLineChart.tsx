"use client";

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
import { MonthlyData } from "@/lib/types";

interface BarLineChartProps {
  data: MonthlyData[];
}

function formatIDRShort(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-slate-300 font-semibold mb-2">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">
              {formatIDRShort(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarLineChart({ data }: BarLineChartProps) {
  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white font-semibold mb-1">Tren Keuangan 6 Bulan</h3>
      <p className="text-slate-400 text-sm mb-6">
        Perbandingan pemasukan dan pengeluaran
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatIDRShort}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-slate-300 text-sm">{value}</span>
            )}
          />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#818cf8"
            strokeWidth={2}
            dot={false}
            name="Tren Pemasukan"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
