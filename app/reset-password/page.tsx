"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Lock, AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/actions/auth";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Link Tidak Valid</h3>
                <p className="text-slate-400 text-sm">Token reset password tidak ditemukan. Pastikan Anda mengklik link yang benar dari email.</p>
              </div>
              <Link href="/forgot-password" className="w-full mt-2">
                <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200">
                  Minta Reset Ulang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    const result = await resetPassword(token!, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 3000);
    } else {
      setError(result.error || "Gagal mereset password.");
    }
  }

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
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-slate-400 text-sm mt-1">
              Masukkan password baru Anda
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Password Berhasil Direset!</h3>
                <p className="text-slate-400 text-sm">Mengalihkan ke halaman login...</p>
              </div>
              <Link href="/login?reset=true" className="w-full mt-2">
                <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200">
                  Masuk Sekarang
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300 text-sm font-medium">
                    Password Baru
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Masukkan password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                  />
                  <p className="text-xs text-slate-500">Minimal 6 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Reset Password
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  ← Kembali ke Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
