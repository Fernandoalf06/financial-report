"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionCategory, TransactionType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";

interface EditTransactionModalProps {
  transaction: Transaction;
  onSave: (updated: Transaction) => void;
}

export default function EditTransactionModal({
  transaction,
  onSave,
}: EditTransactionModalProps) {
  const { categories } = useCategories();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: transaction.date,
    description: transaction.description,
    category: transaction.category as string,
    type: transaction.type as string,
    amount: String(transaction.amount),
  });

  // Sync form when the transaction prop changes (e.g. external update)
  useEffect(() => {
    if (open) {
      setForm({
        date: transaction.date,
        description: transaction.description,
        category: transaction.category as string,
        type: transaction.type as string,
        amount: String(transaction.amount),
      });
    }
  }, [open, transaction]);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const updated: Transaction = {
      ...transaction,
      date: form.date,
      description: form.description,
      category: form.category as TransactionCategory,
      type: form.type as TransactionType,
      amount: parseFloat(form.amount),
    };

    onSave(updated);
    setLoading(false);
    setOpen(false);
  }

  const isValid =
    form.date &&
    form.description.trim() &&
    form.category &&
    form.type &&
    parseFloat(form.amount) > 0;

  return (
    <>
      {/* Trigger button — pencil icon, shown on row hover */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        title="Edit transaksi"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] max-w-md max-h-[85vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <Pencil className="w-4 h-4 text-indigo-400" />
              Edit Transaksi
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Tanggal</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Deskripsi</Label>
              <Input
                type="text"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Category + Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => handleChange("category", v || "")}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-white">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.name}
                        className="focus:bg-white/10"
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Tipe</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleChange("type", v || "")}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-white">
                    <SelectItem value="income" className="focus:bg-white/10">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 shrink-0" />
                      Pemasukan
                    </SelectItem>
                    <SelectItem value="expense" className="focus:bg-white/10">
                      <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1.5 shrink-0" />
                      Pengeluaran
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Jumlah (IDR)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                min="1"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Changed indicator */}
            {(form.amount !== String(transaction.amount) ||
              form.description !== transaction.description ||
              form.category !== transaction.category ||
              form.type !== transaction.type ||
              form.date !== transaction.date) && (
              <p className="text-xs text-amber-400/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                Ada perubahan yang belum disimpan
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
