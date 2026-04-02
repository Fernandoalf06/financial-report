import { redirect } from "next/navigation"
import { getRecurringTransactions } from "@/actions/recurring"
import { getCategories } from "@/actions/category"
import { requireDivision } from "@/lib/auth-utils"
import { RecurringManager } from "@/components/RecurringManager"
import { prisma } from "@/lib/prisma"

export default async function RecurringPage() {
  let user;
  try {
    user = await requireDivision();
  } catch (error) {
    redirect("/dashboard/unassigned")
  }

  const division = await prisma.division.findUnique({
    where: { id: user.divisionId }
  });

  const [recurringRes, catRes] = await Promise.all([
    getRecurringTransactions(),
    getCategories()
  ]);
  
  if (!recurringRes.success || !catRes.success) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-xl mt-8 border border-red-500/20">
        Gagal memuat jadwal transaksi otomatis.
      </div>
    );
  }

  const isHead = user.divisionRole === "HEAD";
  const isEditor = user.divisionRole === "HEAD" || user.divisionRole === "EDITOR";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Transaksi Otomatis</h1>
            <p className="text-slate-400 text-sm">
              Kelola pembayaran rutin dan langganan {division?.name ? <strong className="text-cyan-400">{division.name}</strong> : 'divisi Anda'}.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm font-medium text-slate-300">Total: <span className="text-white font-bold">{recurringRes.data?.length || 0} Siklus</span></p>
             </div>
          </div>
        </div>
      </div>

      <RecurringManager 
        initialData={recurringRes.data as any} 
        categories={catRes.data as any}
        isHead={isHead}
        isEditor={isEditor}
      />
    </div>
  )
}
