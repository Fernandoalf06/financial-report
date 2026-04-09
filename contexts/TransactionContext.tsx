"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { Transaction, CategoryData } from "@/lib/types";
import { useCategories } from "./CategoryContext";
import { 
  addTransaction as addTxServer, 
  updateTransaction as updateTxServer, 
  deleteTransaction as deleteTxServer 
} from "@/actions/transaction";

// ─── Context shape ─────────────────────────────────────────────────────────────
interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (updated: Transaction) => void;
  deleteTransaction: (id: string) => void;

  // Derived data — updates automatically whenever transactions change
  categoryData: CategoryData[];
  summaryStats: {
    totalBalance: number;
    totalIncomeThisMonth: number;
    totalExpenseThisMonth: number;
  };
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function TransactionProvider({
  children,
  initialTransactions,
}: {
  children: ReactNode;
  initialTransactions: Transaction[];
}) {
  const { categories } = useCategories();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Sync state if initialTransactions changes (via Next.js revalidatePath fetching fresh data in Server Component)
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // CRUD
  async function addTransaction(tx: Transaction) {
    const optimisticId = Date.now().toString();
    const optimisticTx = { ...tx, id: optimisticId };
    setTransactions((prev) => [optimisticTx, ...prev]);

    const res = await addTxServer({
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      type: tx.type,
      category: tx.category,
    });
    
    if (!res.success) {
      alert(res.error);
      setTransactions((prev) => prev.filter((t) => t.id !== optimisticId));
    }
  }

  async function updateTransaction(updated: Transaction) {
    const previous = [...transactions];
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updated.id ? updated : tx))
    );

    const res = await updateTxServer(updated.id, {
      description: updated.description,
      amount: updated.amount,
      date: updated.date,
      type: updated.type,
      category: updated.category,
    });

    if (!res.success) {
      alert(res.error);
      setTransactions(previous);
    }
  }

  async function deleteTransaction(id: string) {
    const previous = [...transactions];
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));

    const res = await deleteTxServer(id);
    if (!res.success) {
      alert(res.error);
      setTransactions(previous);
    }
  }

  // ── Derived: category distribution (expense only) ── recomputes on every change
  const categoryData: CategoryData[] = useMemo(() => {
    const expenseTxs = transactions.filter((tx) => tx.type === "expense");
    const totals = new Map<string, number>();
    for (const tx of expenseTxs) {
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }

    // Build result using current category colors from CategoryContext
    const catColorMap = new Map(categories.map((c) => [c.name, c.color]));

    // Fallback color palette for categories not in context
    const fallbackColors = [
      "#6366f1", "#f59e0b", "#ef4444", "#10b981",
      "#3b82f6", "#8b5cf6", "#94a3b8", "#ec4899",
    ];
    let fallbackIdx = 0;

    return Array.from(totals.entries())
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value,
        color:
          catColorMap.get(name) ??
          fallbackColors[fallbackIdx++ % fallbackColors.length],
      }));
  }, [transactions, categories]);

  // ── Derived: summary stats ── recomputes on every change
  const summaryStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalBalance = 0;
    let totalIncomeThisMonth = 0;
    let totalExpenseThisMonth = 0;

    for (const tx of transactions) {
      if (tx.type === "income") totalBalance += tx.amount;
      else totalBalance -= tx.amount;

      const txDate = new Date(tx.date);
      if (
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth
      ) {
        if (tx.type === "income") totalIncomeThisMonth += tx.amount;
        else totalExpenseThisMonth += tx.amount;
      }
    }

    return { totalBalance, totalIncomeThisMonth, totalExpenseThisMonth };
  }, [transactions]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categoryData,
        summaryStats,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx)
    throw new Error("useTransactions must be used inside TransactionProvider");
  return ctx;
}
