"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Settings2 } from "lucide-react";
import { getBudgets, setBudget, deleteBudget } from "@/actions/budget";
import { useCategories } from "@/contexts/CategoryContext";

export default function BudgetManagerModal({ onBudgetChange }: { onBudgetChange: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategories();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    const res = await getBudgets();
    if (res.success && res.data) {
      setBudgets(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchBudgets();
      setIsFormOpen(false);
    }
  }, [isOpen]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const openAddForm = () => {
    setEditingId(undefined);
    setSelectedCatId(categories[0]?.id || "");
    setAmountInput("");
    
    // Default to today -> next month
    const now = new Date();
    setStartDateStr(now.toISOString().split("T")[0]);
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    setEndDateStr(nextMonth.toISOString().split("T")[0]);
    
    setIsFormOpen(true);
  };

  const openEditForm = (b: any) => {
    setEditingId(b.id);
    setSelectedCatId(b.categoryId);
    setAmountInput(b.amount.toString());
    setStartDateStr(new Date(b.startDate).toISOString().split("T")[0]);
    setEndDateStr(new Date(b.endDate).toISOString().split("T")[0]);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteBudget(id);
    if (res.success) {
      await fetchBudgets();
      onBudgetChange();
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !amountInput || !startDateStr || !endDateStr) return;

    if (new Date(startDateStr) > new Date(endDateStr)) {
      alert("Tanggal mulai tidak boleh melebihi tanggal selesai");
      return;
    }

    setIsSaving(true);
    const res = await setBudget(selectedCatId, parseFloat(amountInput), startDateStr, endDateStr, editingId);
    
    if (res.success) {
      await fetchBudgets();
      setIsFormOpen(false);
      onBudgetChange(); // Trigger parent refresh
    } else {
      alert(res.error);
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-white/5"
          >
            <Settings2 className="w-3 h-3 mr-1" />
            Kelola Anggaran
          </Button>
        }
      />
      
      <DialogContent className="border-slate-800 bg-slate-950 text-slate-200 max-w-2xl sm:max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Batas Anggaran (CRUD)</DialogTitle>
        </DialogHeader>

        {!isFormOpen ? (
          <div className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button onClick={openAddForm} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> Tambah Anggaran
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-500">Memuat data...</div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                Belum ada anggaran yang diatur
              </div>
            ) : (
              <div className="rounded-md border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Kategori</th>
                      <th className="px-4 py-2 font-medium">Batas Maksimal</th>
                      <th className="px-4 py-2 font-medium">Periode</th>
                      <th className="px-4 py-2 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {budgets.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.category?.color || "#ccc" }} />
                          {b.category?.name || "Kategori Dihapus"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {formatCurrency(b.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {formatDate(b.startDate)} - {formatDate(b.endDate)}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10" onClick={() => openEditForm(b)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={deletingId === b.id}
                            className={`h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 ${deletingId === b.id ? 'opacity-50' : ''}`} 
                            onClick={() => handleDelete(b.id)}
                          >
                            <Trash2 className={`w-4 h-4 ${deletingId === b.id ? 'animate-pulse' : ''}`} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveBudget} className="space-y-4 pt-4 border-t border-slate-800 mt-2">
            <h3 className="font-semibold text-white mb-2">{editingId ? "Edit Anggaran" : "Tambah Anggaran Baru"}</h3>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 ring-offset-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 pt-2">
              <Label>Jumlah Maksimal (Batas Anggaran)</Label>
              <Input
                type="number"
                placeholder="Contoh: 2000000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="bg-slate-900 border-slate-800 text-slate-200"
                required
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pb-2 pt-2">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-slate-200 [color-scheme:dark]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai</Label>
                <Input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-slate-200 [color-scheme:dark]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSaving ? "Menyimpan..." : "Simpan Anggaran"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
