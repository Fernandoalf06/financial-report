export type TransactionType = "income" | "expense";

// Categories are dynamic per-division from the database
export type TransactionCategory = string;

export interface Transaction {
  id: string;
  date: string; // ISO date string e.g. "2025-03-15"
  description: string;
  category: string;
  type: TransactionType;
  amount: number; // in IDR
}

export interface MonthlyData {
  month: string; // e.g. "Jan", "Feb"
  income: number;
  expense: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface SummaryStats {
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
}
