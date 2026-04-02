"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, ShieldAlert } from "lucide-react";

interface DeleteTransactionDialogProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DeleteTransactionDialog({
  transaction,
  onDelete,
}: DeleteTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  // step 1 = first confirmation, step 2 = final confirmation
  const [step, setStep] = useState<1 | 2>(1);

  function handleOpen() {
    setStep(1);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleConfirmStep1() {
    setStep(2);
  }

  function handleFinalDelete() {
    onDelete(transaction.id);
    setOpen(false);
  }

  return (
    <>
      {/* Trash icon trigger — visible on row hover */}
      <button
        type="button"
        onClick={handleOpen}
        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        title="Hapus transaksi"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">

          {/* ── Step 1: Soft confirmation ───────────────────────────── */}
          {step === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  Hapus Transaksi?
                </DialogTitle>
              </DialogHeader>

              <p className="text-slate-400 text-sm leading-relaxed">
                Anda akan menghapus transaksi berikut:
              </p>

              {/* Transaction card preview */}
              <div className="rounded-xl bg-white/5 border border-white/8 p-4 space-y-2">
                <p className="text-white text-sm font-medium leading-snug">
                  {transaction.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{formatDate(transaction.date)}</span>
                  <span
                    className={
                      transaction.type === "income"
                        ? "text-emerald-400 font-semibold"
                        : "text-rose-400 font-semibold"
                    }
                  >
                    {transaction.type === "income" ? "+" : "−"}
                    {formatIDR(transaction.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-white/8 text-slate-300 text-xs border border-white/10">
                    {transaction.category}
                  </span>
                </div>
              </div>

              <p className="text-slate-500 text-xs">
                Apakah Anda yakin ingin melanjutkan?
              </p>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmStep1}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Ya, Lanjutkan
                </Button>
              </div>
            </>
          )}

          {/* ── Step 2: Final (danger) confirmation ────────────────── */}
          {step === 2 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-rose-400 font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  Konfirmasi Terakhir
                </DialogTitle>
              </DialogHeader>

              <div className="rounded-xl bg-rose-500/8 border border-rose-500/20 p-4 space-y-1">
                <p className="text-rose-300 text-sm font-medium">
                  ⚠ Tindakan ini tidak dapat dibatalkan!
                </p>
                <p className="text-slate-400 text-sm">
                  Data transaksi{" "}
                  <span className="font-semibold text-white">
                    "{transaction.description}"
                  </span>{" "}
                  senilai{" "}
                  <span
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {formatIDR(transaction.amount)}
                  </span>{" "}
                  akan dihapus secara permanen.
                </p>
              </div>

              <p className="text-slate-400 text-sm text-center font-medium">
                Apakah Anda benar-benar yakin ingin menghapusnya?
              </p>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white bg-transparent"
                >
                  Tidak, Batalkan
                </Button>
                <Button
                  type="button"
                  onClick={handleFinalDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Ya, Hapus Sekarang
                </Button>
              </div>
            </>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
