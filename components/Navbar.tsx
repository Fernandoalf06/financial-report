"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { TrendingUp, LogOut, Calendar, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  userName: string;
  globalRole?: string;
}

export default function Navbar({ userName, globalRole }: NavbarProps) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Nav */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  Financial Dashboard
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Laporan Keuangan
                </p>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-4 ml-4 border-l border-white/10 pl-6">
               <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Ringkasan</Link>
               <Link href="/dashboard/analytics" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Analitik</Link>
               <Link href="/dashboard/goals" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Target</Link>
               <Link href="/dashboard/recurring" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Otomasi</Link>
               <Link href="/dashboard/users" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Anggota</Link>
               {/* <Link href="/dashboard/audit" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Audit Log</Link> */}
               
               {globalRole === "SUPERADMIN" && (
                 <Link href="/superadmin" className="ml-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded hover:bg-rose-500/20 transition-colors">
                   <ShieldAlert className="w-3.5 h-3.5" /> System Console
                 </Link>
               )}
            </div>
          </div>

          {/* Right side: date + user + logout */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">
                {userName}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
