import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSuperAdminStats } from "@/actions/superadmin";
import { 
  Building2, Users, Receipt, Target, 
  Activity, ArrowUpRight, Database 
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default async function SuperAdminPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user || user.globalRole !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const result = await getSuperAdminStats();

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-500/10 rounded-xl mt-8 border border-rose-500/20">
        Gagal memuat status sistem: {result.error}
      </div>
    );
  }

  const { totalUsers, totalDivisions, divisions } = result.data;

  // Compute some global aggregates
  const totalGlobalTx = divisions.reduce((sum: number, d: any) => sum + d.transactionCount, 0);
  const totalGlobalGoals = divisions.reduce((sum: number, d: any) => sum + d.goalCount, 0);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Header Splash */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -mb-20 -ml-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
              Sistem Pengawasan <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">Global</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Selamat datang di konsol utama. Anda memiliki otoritas absolut untuk melihat metrik pendaftaran tenant, kesehatan database, dan utilisasi tabel di seluruh ruang kerja klien.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <Activity className="w-8 h-8 text-rose-400" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-0.5">Status Server</p>
              <p className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operasional Normal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-blue-500/10 transition-colors">
              <Building2 className="w-24 h-24" />
           </div>
           <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Total Tenant (Divisi)</p>
           <p className="text-3xl font-black text-white relative z-10">{totalDivisions}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-violet-500/10 transition-colors">
              <Users className="w-24 h-24" />
           </div>
           <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Total Pengguna Terdaftar</p>
           <p className="text-3xl font-black text-white relative z-10">{totalUsers}</p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-emerald-500/10 transition-colors">
              <Receipt className="w-24 h-24" />
           </div>
           <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Total Row Transaksi</p>
           <p className="text-3xl font-black text-white relative z-10">{totalGlobalTx}</p>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-amber-500/10 transition-colors">
              <Target className="w-24 h-24" />
           </div>
           <p className="text-sm text-slate-400 font-medium mb-1 relative z-10">Total Target Finansial</p>
           <p className="text-3xl font-black text-white relative z-10">{totalGlobalGoals}</p>
        </div>
      </div>

      {/* Divisions Table */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
             <Database className="w-5 h-5 text-rose-400" /> Database Ruang Kerja
           </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold rounded-tl-lg">ID Internal</th>
                <th className="p-4 font-semibold">Nama Tenant / Divisi</th>
                <th className="p-4 font-semibold">Head (Pemilik)</th>
                <th className="p-4 font-semibold">Anggota</th>
                <th className="p-4 font-semibold">Volume TX</th>
                <th className="p-4 font-semibold">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {divisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Sistem kosong. Belum ada divisi yang dibuat.
                  </td>
                </tr>
              ) : (
                divisions.map((div: any) => (
                  <tr key={div.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-500">{div.id.substring(0,8)}...</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{div.name}</div>
                    </td>
                    <td className="p-4">
                      {div.heads.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {div.heads.map((h: string) => (
                            <span key={h} className="inline-block px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] rounded-md border border-rose-500/20">{h}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                       <span className="font-semibold text-white">{div.userCount}</span> users
                    </td>
                    <td className="p-4 text-slate-300">
                       <span className="font-semibold text-white">{div.transactionCount}</span> recs
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {format(new Date(div.createdAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
