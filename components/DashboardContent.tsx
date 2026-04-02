"use client";

import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import TrendChart from "@/components/TrendChart";
import DonutChart from "@/components/DonutChart";
import BudgetProgressBars from "@/components/BudgetProgressBars";
import TransactionTable from "@/components/TransactionTable";
import { useTransactions } from "@/contexts/TransactionContext";

export default function DashboardContent() {
  const { summaryStats } = useTransactions();

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Keuangan</h1>
        <p className="text-slate-400 mt-1">
          Ringkasan laporan keuangan periode berjalan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SummaryCard
          title="Total Saldo"
          value={summaryStats.totalBalance}
          icon={Wallet}
          color="indigo"
        />
        <SummaryCard
          title="Pemasukan Bulan Ini"
          value={summaryStats.totalIncomeThisMonth}
          icon={TrendingUp}
          color="emerald"
        />
        <SummaryCard
          title="Pengeluaran Bulan Ini"
          value={summaryStats.totalExpenseThisMonth}
          icon={TrendingDown}
          color="rose"
        />
      </div>

      {/* Charts & Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <DonutChart />
          <BudgetProgressBars />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionTable />
    </div>
  );
}
