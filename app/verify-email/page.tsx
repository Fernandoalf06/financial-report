"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TrendingUp, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { verifyEmail } from "@/actions/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Token verifikasi tidak ditemukan. Pastikan Anda mengklik link yang benar dari email.");
        return;
      }

      const result = await verifyEmail(token);

      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Email berhasil diverifikasi!");
      } else {
        setStatus("error");
        setMessage(result.error || "Gagal memverifikasi email.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifikasi Email</h1>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
              <p className="text-slate-400 text-sm">Memverifikasi email Anda...</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4 text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Verifikasi Berhasil!</h3>
                <p className="text-slate-400 text-sm">{message}</p>
              </div>
              <Link href="/login?verified=true" className="w-full mt-2">
                <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200">
                  Masuk ke Akun Anda
                </Button>
              </Link>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4 text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Verifikasi Gagal</h3>
                <p className="text-slate-400 text-sm">{message}</p>
              </div>
              <div className="w-full mt-2 space-y-2">
                <Link href="/login" className="block w-full">
                  <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200">
                    Ke Halaman Login
                  </Button>
                </Link>
                <p className="text-xs text-slate-500">
                  Anda bisa mengirim ulang email verifikasi dari halaman login.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
