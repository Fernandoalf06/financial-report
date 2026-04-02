"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Pencil, Wallet } from "lucide-react";
import { useTransactions } from "@/contexts/TransactionContext";
import { useCategories } from "@/contexts/CategoryContext";
import { getBudgets } from "@/actions/budget";
import BudgetManagerModal from "./BudgetManagerModal";

export default function BudgetProgressBars() {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Instead of a global currentPeriod, we'll let users view active budgets based on TODAY
  // The progress bar will calculate spend based on each budget's specific startDate and endDate

  const fetchBudgets = async () => {
    setLoading(true);
    const res = await getBudgets();
    if (res.success && res.data) {
      setBudgets(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Calculate actual spending per category for the current month
  // Calculate actual spending per category dynamically based on their budget dates
  // For categories without a budget, we'll just show spending for the last 30 days as a fallback
  const spendingPerCat = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");

    const mapping: Record<string, number> = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const cat of categories) {
      const budgetObj = budgets.find((b) => b.categoryId === cat.id);
      
      let start = thirtyDaysAgo;
      let end = now;
      if (budgetObj) {
        start = new Date(budgetObj.startDate);
        end = new Date(budgetObj.endDate);
      }
      
      // Ensure the dates cover the full 24-hour period of the start/end limits
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const spent = expenses
        .filter((t) => t.category === cat.name)
        .filter((t) => {
          const d = new Date(t.date);
          return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      mapping[cat.id] = spent;
    }
    return mapping;
  }, [transactions, categories, budgets]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Build the list of active budgets to display
  // Prioritize categories that have a budget set, then ones that have spending
  const displayItems = useMemo(() => {
    const items = [];
    for (const cat of categories) {
      const budgetObj = budgets.find((b) => b.categoryId === cat.id);
      const limit = budgetObj?.amount || 0;
      const spent = spendingPerCat[cat.id] || 0;

      if (limit > 0 || spent > 0) {
        let percent = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;
        if (percent > 100) percent = 100;

        let dateRangeLabel = "";
        if (budgetObj) {
          const sDate = new Date(budgetObj.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          const eDate = new Date(budgetObj.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          dateRangeLabel = `${sDate} - ${eDate}`;
        }
        
        items.push({
          ...cat,
          limit,
          spent,
          percent,
          isOver: limit > 0 && spent > limit,
          dateRangeLabel
        });
      }
    }
    // Sort: highest spent first, or over-budget first
    return items.sort((a, b) => b.spent - a.spent);
  }, [categories, budgets, spendingPerCat]);

  return (
    <>
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-rose-400" />
            Batas Anggaran
          </CardTitle>
          <BudgetManagerModal onBudgetChange={fetchBudgets} />
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-8 space-y-2 flex flex-col items-center">
               <Wallet className="w-10 h-10 opacity-20 mb-2 text-white" />
               <p>Belum ada anggaran yang diatur.</p>
               <p className="text-xs mt-1 text-slate-600">Klik "Kelola Anggaran" di atas untuk menambahkan limit pengeluaran per kategori.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayItems.map((item) => (
                <div key={item.id} className="space-y-2 group">
                  <div className="flex justify-between items-end text-sm">
                    <div className="flex items-center gap-2">
                       <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="text-slate-300 font-medium">{item.name}</span>
                      {item.dateRangeLabel && (
                        <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-sm">
                          {item.dateRangeLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={item.isOver ? "text-red-400 font-semibold" : "text-white"}>
                        {formatCurrency(item.spent)}
                      </span>
                      {item.limit > 0 && (
                        <span className="text-slate-500 text-xs ml-1">
                          / {formatCurrency(item.limit)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {item.limit > 0 ? (
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${item.isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                         style={{ width: `${item.percent}%` }}
                       />
                    </div>
                  ) : (
                     <div className="relative h-1 w-full bg-slate-800 rounded-full overflow-hidden opacity-50">
                     </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                     <span>
                       {item.limit > 0 ? `${item.percent.toFixed(0)}% terpakai` : "Tanpa batas"}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
