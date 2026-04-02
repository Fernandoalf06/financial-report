import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut, UserMinus } from "lucide-react";

export default async function UnassignedPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;
  if (!user || user.divisionId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg mb-6">
          <UserMinus className="w-8 h-8 text-slate-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Menunggu Undangan Tautan Divisi</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Halo <strong className="text-white">{session.user?.name}</strong>, akun Anda belum terhubung ke Divisi mana pun. Anda memerlukan Kepala Divisi yang memiliki wewenang untuk memasukkan Anda ke dalam ruang kerja laporan keuangan mereka.
        </p>

        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-left mb-8">
           <h3 className="text-slate-300 font-semibold mb-2 text-sm text-center">Apa yang harus Anda lakukan?</h3>
           <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
             <li>Hubungi Kepala Divisi atau Administrator Anda.</li>
             <li>Berikan <strong>Username ({session.user?.name})</strong> Anda kepada mereka.</li>
             <li>Minta mereka untuk menambahkan Anda dari menu Manajemen Anggota.</li>
             <li>Silakan muat ulang (Refresh) halaman ini sesekali.</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
