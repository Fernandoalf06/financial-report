import { redirect } from "next/navigation"
import { getGoals } from "@/actions/goal"
import { requireDivision } from "@/lib/auth-utils"
import { GoalManager } from "@/components/GoalManager"
import { prisma } from "@/lib/prisma"

export default async function GoalsPage() {
  let user;
  try {
    user = await requireDivision();
  } catch (error) {
    redirect("/dashboard/unassigned")
  }

  // Fetch the division name for the header
  const division = await prisma.division.findUnique({
    where: { id: user.divisionId }
  });

  const goalsRes = await getGoals();
  
  if (!goalsRes.success) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-xl mt-8 border border-red-500/20">
        Gagal memuat target finansial.
      </div>
    );
  }

  // Define role permission for the active user view
  const isHead = user.divisionRole === "HEAD";
  const isEditor = user.divisionRole === "HEAD" || user.divisionRole === "EDITOR";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Target Finansial</h1>
            <p className="text-slate-400 text-sm">
              Rencanakan dan lacak tujuan tabungan atau ekspansi modal untuk {division?.name ? <strong className="text-emerald-400">{division.name}</strong> : 'divisi Anda'}.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm font-medium text-slate-300">Total: <span className="text-white font-bold">{goalsRes.data?.length || 0} Target</span></p>
             </div>
          </div>
        </div>
      </div>

      <GoalManager 
        initialGoals={goalsRes.data || []} 
        isHead={isHead}
        isEditor={isEditor}
      />
    </div>
  )
}
