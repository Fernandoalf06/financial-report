"use client";

import { useState, useMemo } from "react";
import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpCircle, ArrowDownCircle, Search, ArrowUpDown } from "lucide-react";
import AddTransactionModal from "./AddTransactionModal";
import CategoryManagerModal from "./CategoryManagerModal";
import ExportButtons from "./ExportButtons";
import EditTransactionModal from "./EditTransactionModal";
import DeleteTransactionDialog from "./DeleteTransactionDialog";
import { useTransactions } from "@/contexts/TransactionContext";

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionTable() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Get unique categories for the dropdown from transactions
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map((tx) => tx.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === "all" || tx.category === filterCategory;
        const matchType = filterType === "all" || tx.type === filterType;
        return matchSearch && matchCat && matchType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, searchTerm, filterCategory, filterType, sortOrder]);

  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-2xl shadow-xl overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="px-6 py-5 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              Daftar Transaksi
              <Badge variant="secondary" className="bg-white/10 text-slate-300 font-normal hover:bg-white/10">
                {filteredTransactions.length}
              </Badge>
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ExportButtons transactions={filteredTransactions} />
            <CategoryManagerModal />
            <AddTransactionModal onAdd={addTransaction} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Cari deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 h-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
            <SelectTrigger className="w-full sm:w-[160px] bg-slate-800/50 border-white/10 text-white h-9">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
            <SelectTrigger className="w-full sm:w-[150px] bg-slate-800/50 border-white/10 text-white h-9">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="shrink-0 h-9 w-9 bg-slate-800/50 border-white/10 text-slate-300 hover:text-white"
            title={sortOrder === "desc" ? "Urutkan Terlama Dahulu" : "Urutkan Terbaru Dahulu"}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-slate-400 font-medium">Tanggal</TableHead>
              <TableHead className="text-slate-400 font-medium">Deskripsi</TableHead>
              <TableHead className="text-slate-400 font-medium">Kategori</TableHead>
              <TableHead className="text-slate-400 font-medium">Tipe</TableHead>
              <TableHead className="text-slate-400 font-medium text-right">
                Jumlah
              </TableHead>
              {/* Edit column — narrow, no header text */}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                  Tidak ada transaksi yang cocok dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow
                key={tx.id}
                className="border-white/5 hover:bg-white/3 transition-colors duration-150 group"
              >
                <TableCell className="text-slate-300 text-sm whitespace-nowrap">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="text-white text-sm font-medium max-w-[200px] truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{tx.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-slate-300 border-white/10 bg-white/5 text-xs"
                  >
                    {tx.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tx.type === "income" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      Pemasukan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                      Pengeluaran
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold text-sm ${
                      tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatIDR(tx.amount)}
                  </span>
                </TableCell>
                {/* Edit + Delete — appear on row hover */}
                <TableCell className="text-center pr-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5">
                    <EditTransactionModal
                      transaction={tx}
                      onSave={updateTransaction}
                    />
                    <DeleteTransactionDialog
                      transaction={tx}
                      onDelete={deleteTransaction}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
