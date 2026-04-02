"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTransactions } from "@/contexts/TransactionContext";

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-slate-800 border border-white/10 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white font-semibold">{item.name}</p>
        <p className="text-slate-300">{formatIDR(item.value)}</p>
        <p className="text-slate-400 text-xs">
          {(item.payload.percent * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DonutChart() {
  const { categoryData } = useTransactions();

  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white font-semibold mb-1">Distribusi Pengeluaran</h3>
      <p className="text-slate-400 text-sm mb-6">Berdasarkan kategori</p>
      {categoryData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Belum ada pengeluaran</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-slate-300 text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
