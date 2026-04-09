"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TrendingUp, Lock, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { registerTenant } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isHead, setIsHead] = useState(false);
  const [divisionName, setDivisionName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== passwordConfirm) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid.");
      setLoading(false);
      return;
    }

    const payload = isHead 
      ? { username, email, passwordHash: password, divisionName }
      : { username, email, passwordHash: password };

    const result = await registerTenant(payload);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal membuat akun.");
    } else {
      setSuccess(true);
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
            <h1 className="text-2xl font-bold text-white">Buat Akun Divisi</h1>
            <p className="text-slate-400 text-sm mt-1">
              Daftar untuk mengakses dashboard keuangan anda
            </p>
          </div>

          {/* Success Message */}
          {success ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                  <Mail className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Pendaftaran Berhasil!</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Kami telah mengirimkan email verifikasi ke alamat email Anda. 
                  Silakan buka email tersebut dan klik link verifikasi untuk mengaktifkan akun Anda.
                </p>
              </div>
              <div className="mt-2 space-y-2 w-full">
                <Link href="/login">
                  <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all duration-200">
                    Ke Halaman Login
                  </Button>
                </Link>
                <p className="text-xs text-slate-500 text-center">
                  Tidak menerima email? Periksa folder spam Anda.
                </p>
              </div>
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Switcher */}
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setIsHead(false)}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                      !isHead ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Staf Biasa
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHead(true)}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
                      isHead ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Kepala Divisi
                  </button>
                </div>
                
                {isHead && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="divisionName" className="text-slate-300 text-sm font-medium">
                      Nama Divisi Baru
                    </Label>
                    <Input
                      id="divisionName"
                      type="text"
                      placeholder="Contoh: Divisi Keuangan Pemasaran"
                      value={divisionName}
                      onChange={(e) => setDivisionName(e.target.value)}
                      required={isHead}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                    />
                  </div>
                )}

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
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                  />
                  <p className="text-xs text-slate-500">
                    Email ini akan digunakan untuk verifikasi akun dan reset password.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Buat password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm" className="text-slate-300 text-sm font-medium">
                    Konfirmasi Password
                  </Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Ulangi password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
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
                      Daftar Sekarang
                    </span>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center mt-6">
                <p className="text-sm text-slate-400">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
