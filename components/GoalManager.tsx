"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
  Target, Plus, Edit2, Trash2, TrendingUp, AlertCircle, Coins
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
import { addGoal, updateGoal, updateGoalProgress, deleteGoal } from "@/actions/goal";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  color: string;
};

export function GoalManager({ 
  initialGoals, 
  isEditor,
  isHead 
}: { 
  initialGoals: Goal[], 
  isEditor: boolean,
  isHead: boolean 
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [isOpen, setIsOpen] = useState(false);
  const [depositOpenId, setDepositOpenId] = useState<string | null>(null);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [depositAmount, setDepositAmount] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setTargetAmount("");
    setDeadline("");
    setColor("#6366f1");
    setError("");
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
    setColor(goal.color);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Target jumlah tidak valid");
      setLoading(false);
      return;
    }

    if (editingId) {
      const res = await updateGoal(editingId, { name, targetAmount: amount, deadline, color });
      if (res.success && res.data) {
        setGoals(goals.map(g => g.id === editingId ? res.data as Goal : g));
        setIsOpen(false);
      } else {
        setError(res.error || "Gagal mengubah target");
      }
    } else {
      const res = await addGoal({ name, targetAmount: amount, deadline, color });
      if (res.success && res.data) {
        setGoals([...goals, res.data as Goal]);
        setIsOpen(false);
      } else {
        setError(res.error || "Gagal membuat target");
      }
    }
    setLoading(false);
  };

  const handleDeposit = async (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    setLoading(true);
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Nominal tidak valid");
      setLoading(false);
      return;
    }

    const res = await updateGoalProgress(goalId, amount);
    if (res.success && res.data) {
       setGoals(goals.map(g => g.id === goalId ? res.data as Goal : g));
       setDepositOpenId(null);
       setDepositAmount("");
    } else {
       alert(res.error || "Gagal menyetor dana");
    }
    setLoading(false);
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Hapus target tabungan ini? Dana yang sudah tercatat akan hilang dari pelacakan (namun tidak mengubah riwayat transaksi).")) return;
    
    setLoading(true);
    const res = await deleteGoal(goalId);
    if (res.success) {
      setGoals(goals.filter(g => g.id !== goalId));
    } else {
      alert(res.error || "Gagal menghapus target");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" /> Target Finansial Aktif
        </h2>
        {isEditor && (
          <Dialog open={isOpen} onOpenChange={(v) => {
            if (!v) resetForm();
            setIsOpen(v);
          }}>
            <DialogTrigger
              render={
                <Button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20">
                  <Plus className="w-4 h-4 mr-1.5" /> Buat Target Baru
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{editingId ? 'Edit Target' : 'Buat Target Finansial'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Nama Target (misal: Dana Darurat)</Label>
                  <Input 
                    required value={name} onChange={e => setName(e.target.value)} 
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Nominal Rupiah</Label>
                  <Input 
                    required type="number" min="0" step="1"
                    value={targetAmount} onChange={e => setTargetAmount(e.target.value)} 
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tenggat Waktu Achivement (Opsional)</Label>
                  <Input 
                    type="date"
                    value={deadline} onChange={e => setDeadline(e.target.value)} 
                    className="bg-white/5 border-white/10 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warna Identitas (Hex)</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color" value={color} onChange={e => setColor(e.target.value)} 
                      className="w-14 h-11 p-1 bg-white/5 border-white/10 cursor-pointer"
                    />
                    <Input 
                      type="text" value={color} onChange={e => setColor(e.target.value)} 
                      className="flex-1 bg-white/5 border-white/10 font-mono"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500">
                  {loading ? 'Menyimpan...' : 'Simpan Target'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/5 border border-white/10 rounded-2xl border-dashed">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-300 font-medium text-lg">Belum ada target finansial</h3>
            <p className="text-slate-500 text-sm mt-1">Gunakan fitur ini untuk melacak tabungan atau dana ekspansi.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden flex flex-col group">
                {/* Background Glow */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: goal.color }}
                />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${goal.color}20`, border: `1px solid ${goal.color}30` }}
                    >
                      <Target className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-slate-400">
                          Target: {format(new Date(goal.deadline), "d MMM yyyy", { locale: idLocale })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Dropdown / Icons */}
                  {isEditor && (
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => handleOpenEdit(goal)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {isHead && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(goal.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Stats */}
                <div className="mt-auto relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        {formatRupiah(goal.currentAmount)}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">dari {formatRupiah(goal.targetAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black" style={{ color: isCompleted ? '#10b981' : goal.color }}>
                        {progress.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 mb-4">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ 
                        width: `${progress}%`, 
                        backgroundColor: isCompleted ? '#10b981' : goal.color,
                        boxShadow: `0 0 10px ${isCompleted ? '#10b981' : goal.color}80`
                      }}
                    >
                       <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'translateX(-100%)' }} />
                    </div>
                  </div>

                  {/* Deposit Action */}
                  {isEditor && !isCompleted && (
                    <>
                      {depositOpenId === goal.id ? (
                        <form onSubmit={(e) => handleDeposit(e, goal.id)} className="flex items-center gap-2 animate-in slide-in-from-top-2">
                           <Input 
                             type="number" min="1" required autoFocus
                             placeholder="Nominal Rupiah"
                             value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                             className="h-8 text-sm bg-slate-900 border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                           />
                           <Button type="submit" size="sm" disabled={loading} className="h-8 bg-indigo-600 hover:bg-indigo-500 px-3">
                             {loading ? '...' : 'Setor'}
                           </Button>
                           <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setDepositOpenId(null)}>Batal</Button>
                        </form>
                      ) : (
                         <Button 
                           variant="outline" size="sm" 
                           className="w-full h-8 bg-transparent border-white/10 hover:bg-white/5 text-slate-300"
                           onClick={() => setDepositOpenId(goal.id)}
                         >
                           <Coins className="w-4 h-4 mr-2" /> Top-up / Setor Dana
                         </Button>
                      )}
                    </>
                  )}
                  {isCompleted && (
                    <div className="w-full text-center py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-sm font-semibold flex items-center justify-center gap-2">
                       <Target className="w-4 h-4" /> Target Tercapai!
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
