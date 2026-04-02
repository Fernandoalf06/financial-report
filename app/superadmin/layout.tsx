import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.globalRole !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-rose-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/superadmin" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-rose-500 text-sm tracking-wide">
                    SYSTEM DASHBOARD
                  </span>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Super Admin Console
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden sm:flex text-sm text-slate-400 hover:text-white items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Buka Dashboard Aplikasi
              </Link>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-400 text-sm font-semibold uppercase tracking-wider hidden sm:block">
                  {user.username} (Root)
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {children}
      </main>
    </div>
  );
}
