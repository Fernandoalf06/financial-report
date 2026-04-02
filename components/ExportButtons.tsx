"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Transaction } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportButtons({ transactions }: { transactions: Transaction[] }) {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleExportCSV = () => {
    setIsExportingCSV(true);
    try {
      // Create CSV Header
      const headers = ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah"];
      
      // Create CSV Rows
      const rows = transactions.map(tx => [
        `"${formatDate(tx.date)}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        `"${tx.category}"`,
        `"${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}"`,
        tx.amount
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_Keuangan_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Gagal mengexport CSV");
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Laporan Keuangan", 14, 20);
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${formatDate(new Date().toISOString())}`, 14, 28);

      const tableColumn = ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah"];
      const tableRows = transactions.map(tx => [
        formatDate(tx.date),
        tx.description,
        tx.category,
        tx.type === "income" ? "Pemasukan" : "Pengeluaran",
        formatIDR(tx.amount)
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] } // indigo-600
      });

      doc.save(`Laporan_Keuangan_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Gagal mengexport PDF. Pastikan jspdf terinstall.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={isExportingCSV || transactions.length === 0}
        className="h-9 border-white/10 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
        {isExportingCSV ? "Mengekspor..." : "Export CSV"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExportingPDF || transactions.length === 0}
        className="h-9 border-white/10 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50"
      >
        <FileText className="w-4 h-4 mr-2 text-rose-400" />
        {isExportingPDF ? "Mengekspor..." : "Export PDF"}
      </Button>
    </div>
  );
}
