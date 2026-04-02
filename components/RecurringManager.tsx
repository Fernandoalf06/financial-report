"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
  Repeat, Plus, Trash2, ArrowRightCircle, AlertCircle, CalendarClock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addRecurringTransaction, deleteRecurringTransaction } from "@/actions/recurring";

type Category = {
  id: string;
  name: string;
  color: string;
};

type RecurringTx = {
  id: string;
  description: string;
  amount: number;
  type: string;
  frequency: string;
  nextDate: string;
  category: Category;
};

export function RecurringManager({ 
  initialData, 
  categories,
  isEditor,
  isHead 
}: { 
  initialData: RecurringTx[], 
  categories: Category[],
  isEditor: boolean,
  isHead: boolean 
}) {
  const [schedules, setSchedules] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form States
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("MONTHLY");
  const [nextDate, setNextDate] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.name || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getFrequencyLabel = (freq: string) => {
    switch(freq) {
      case "DAILY": return "Harian";
      case "WEEKLY": return "Mingguan";
      case "MONTHLY": return "Bulanan";
      default: return freq;
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setType("expense");
    setFrequency("MONTHLY");
    setNextDate("");
    setCategoryId(categories[0]?.name || "");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Nominal tidak valid");
      setLoading(false);
      return;
    }

    if (!nextDate) {
      setError("Tanggal pelaksanaan pertama belum dipilih");
      setLoading(false);
      return;
    }

    const res = await addRecurringTransaction({ 
      description, 
      amount: parsedAmount, 
      type, 
      frequency, 
      nextDate, 
      category: categoryId 
    }) as any;

    if (res.success && res.data) {
      // Refresh to grab nested relations nicely (Hack for simplicity without pushing raw state)
      window.location.reload(); 
    } else {
      setError(res.error || "Gagal membuat jadwal transaksi");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hentikan siklus transaksi berulang ini? Transaksi historis yang sudah masuk tidak akan terhapus.")) return;
    
    setLoading(true);
    const res = await deleteRecurringTransaction(id);
    if (res.success) {
      setSchedules(schedules.filter(s => s.id !== id));
    } else {
      alert(res.error || "Gagal menghapus jadwal");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Repeat className="w-5 h-5 text-indigo-400" /> Jadwal Berlangsung
        </h2>
        
        {isEditor && (
          <Dialog open={isOpen} onOpenChange={(v) => { if(!v) resetForm(); setIsOpen(v); }}>
            <DialogTrigger
              render={
                <Button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1.5" /> Buat Siklus Baru
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex flex-col">
                  Jadwalkan Transaksi
                  <span className="text-sm text-slate-400 font-normal mt-1">Sistem akan secara otomatis mencatat pengeluaran/pemasukan ini secara berulang.</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Jenis Transaksi</Label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
                      <button type="button" onClick={() => setType("expense")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === "expense" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-400 hover:text-white"}`}>Pengeluaran</button>
                      <button type="button" onClick={() => setType("income")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === "income" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-white"}`}>Pemasukan</button>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Kategori Pembukuan</Label>
                    <select 
                      required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-md text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 col-span-2">
                     <Label>Deskripsi / Keterangan</Label>
                     <Input required value={description} onChange={e => setDescription(e.target.value)} placeholder="Contoh: Pembayaran Hosting Harian" className="bg-white/5 border-white/10" />
                  </div>
                  
                  <div className="space-y-2 col-span-2 md:col-span-1">
                     <Label>Nominal Rupiah</Label>
                     <Input required type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white/5 border-white/10" />
                  </div>
                  
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label>Siklus Eksekusi</Label>
                    <select 
                      required value={frequency} onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-md text-slate-200 px-3 focus:outline-none focus:border-indigo-500"
                    >
                       <option value="DAILY" className="bg-slate-900">Setiap Hari</option>
                       <option value="WEEKLY" className="bg-slate-900">Míngguan</option>
                       <option value="MONTHLY" className="bg-slate-900">Bulanan</option>
                    </select>
                  </div>

                  <div className="space-y-2 col-span-2">
                     <Label>Tanggal Jatuh Tempo Berikutnya</Label>
                     <Input required type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="bg-white/5 border-white/10 [color-scheme:dark]" />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                  {loading ? 'Menyimpan...' : 'Aktifkan Jadwal Automasi'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Overview List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/5 border border-white/10 rounded-2xl border-dashed">
            <CalendarClock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-300 font-medium text-lg">Belum ada Transaksi Otomatis</h3>
            <p className="text-slate-500 text-sm mt-1 mb-4 max-w-sm mx-auto">Tingkatkan efisiensi kerja dengan menjadwalkan pembayaran tagihan, invoice server, atau gaji staf secara berkala!</p>
          </div>
        ) : (
          schedules.map((item) => {
            const isExpense = item.type === "expense";
            return (
              <div key={item.id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl relative group">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="inline-flex py-1 px-2.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/5 text-slate-300 border border-white/10 mb-2">
                          Siklus {getFrequencyLabel(item.frequency)}
                       </span>
                       <h3 className="text-white font-semibold flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.category.color }} />
                         {item.description}
                       </h3>
                     </div>

                     {isHead && (
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="opacity-100 sm:opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     )}
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center mb-4">
                     <span className="text-slate-400 text-sm">Nominal</span>
                     <span className={`font-bold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}{formatRupiah(item.amount)}
                     </span>
                  </div>

                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex justify-between items-center">
                     <div className="flex items-center gap-2 text-indigo-300 text-sm">
                        <ArrowRightCircle className="w-4 h-4" /> Eksekusi Selanjutnya
                     </div>
                     <span className="font-semibold text-white text-sm">
                        {format(new Date(item.nextDate), "d MMM yyyy", { locale: idLocale })}
                     </span>
                  </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
