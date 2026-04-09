"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TrendingUp, Lock, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { resendVerificationEmail, checkLoginEligibility } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  
  // Optional success msg from redirect
  const registered = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('registered') : null;
  const verified = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('verified') : null;
  const resetSuccess = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('reset') : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEmailNotVerified(false);
    setResendSuccess("");

    // Pre-check: detect unverified email before calling NextAuth
    const check = await checkLoginEligibility(username, password);
    
    if (!check.eligible) {
      setLoading(false);
      if (check.reason === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setResendEmail(check.email || "");
        setError("Email Anda belum diverifikasi. Silakan periksa email Anda atau kirim ulang email verifikasi.");
        return;
      }
      setError("Username atau password salah. Silakan coba lagi.");
      return;
    }

    // Credentials are valid and email is verified — proceed with signIn
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Username atau password salah. Silakan coba lagi.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleResendVerification() {
    if (!resendEmail) {
      setError("Masukkan email Anda untuk mengirim ulang verifikasi.");
      return;
    }
    setResendLoading(true);
    setResendSuccess("");
    setError("");

    const result = await resendVerificationEmail(resendEmail);
    setResendLoading(false);

    if (result.success) {
      setResendSuccess(result.message || "Email verifikasi telah dikirim ulang.");
    } else {
      setError(result.error || "Gagal mengirim email verifikasi.");
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
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Akses portal laporan keuangan
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Resend Success */}
          {resendSuccess && (
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resendSuccess}</span>
            </div>
          )}
          
          {/* Success Messages from redirects */}
          {registered && !error && !resendSuccess && (
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Pendaftaran berhasil! Silakan periksa email untuk verifikasi.</span>
            </div>
          )}

          {verified && !error && !resendSuccess && (
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Email berhasil diverifikasi! Silakan login.</span>
            </div>
          )}

          {resetSuccess && !error && !resendSuccess && (
            <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password berhasil direset! Silakan login dengan password baru.</span>
            </div>
          )}

          {/* Email Not Verified — Resend Form */}
          {emailNotVerified ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
                  <Mail className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Email Belum Diverifikasi</h3>
                <p className="text-slate-400 text-sm">Masukkan email Anda untuk mengirim ulang link verifikasi.</p>
              </div>

              <div className="space-y-2">
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                />
              </div>

              <Button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-70"
              >
                {resendLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Kirim Ulang Email Verifikasi
                  </span>
                )}
              </Button>

              <button
                onClick={() => {
                  setEmailNotVerified(false);
                  setError("");
                  setResendSuccess("");
                }}
                className="w-full text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Kembali ke login
              </button>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300 text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                      Password
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
                      Masuk ke Dashboard
                    </span>
                  )}
                </Button>
              </form>

              {/* Footer note */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-sm text-slate-400">
                  Belum punya akun divisi?{" "}
                  <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Daftar sekarang
                  </Link>
                </p>
                <p className="text-xs text-slate-500">
                  Akses terbatas untuk administrator 
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
