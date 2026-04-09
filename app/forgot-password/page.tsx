"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid.");
      setLoading(false);
      return;
    }

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setSuccessMessage(result.message || "");
    } else {
      setError(result.error || "Gagal mengirim email reset password.");
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
            <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
            <p className="text-slate-400 text-sm mt-1">
              Masukkan email Anda untuk mereset password
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <Mail className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Email Terkirim!</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  {successMessage || "Jika email terdaftar, kami akan mengirimkan link reset password. Periksa kotak masuk dan folder spam Anda."}
                </p>
              </div>
              <Link href="/login" className="w-full mt-2">
                <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in-0 slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Masukkan email terdaftar Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
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
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Kirim Link Reset Password
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
