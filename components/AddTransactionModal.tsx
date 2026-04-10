"use client";

import { useState } from "react";
import { Transaction, TransactionCategory, TransactionType } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";


interface AddTransactionModalProps {
  onAdd: (tx: Transaction) => void;
}

export default function AddTransactionModal({ onAdd }: AddTransactionModalProps) {
  const { categories } = useCategories();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "" as TransactionCategory,
    type: "" as TransactionType,
    amount: "",
  });

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: form.date,
      description: form.description,
      category: form.category as TransactionCategory,
      type: form.type as TransactionType,
      amount: parseFloat(form.amount),
    };

    onAdd(newTx);
    setLoading(false);
    setOpen(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "" as TransactionCategory,
      type: "" as TransactionType,
      amount: "",
    });
  }

  const isValid =
    form.date &&
    form.description &&
    form.category &&
    form.type &&
    parseFloat(form.amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <DialogTrigger
        render={
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 gap-1.5">
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        }
      />
      <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] max-w-md max-h-[85vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            Tambah Transaksi Baru
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
              placeholder="Contoh: Pembayaran Proyek A"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Row: Category + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  handleChange("category", v as TransactionCategory)
                }
                required
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="focus:bg-white/10">
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
                onValueChange={(v) => handleChange("type", v as TransactionType)}
                required
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="income" className="focus:bg-white/10">
                    Pemasukan
                  </SelectItem>
                  <SelectItem value="expense" className="focus:bg-white/10">
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
              placeholder="Contoh: 5000000"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              min="1"
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

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
              {loading ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
