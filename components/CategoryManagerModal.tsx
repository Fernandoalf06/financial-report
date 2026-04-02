"use client";

import { useState } from "react";
import { useCategories, Category } from "@/contexts/CategoryContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Pencil, Trash2, Check, X } from "lucide-react";

// ─── Color palette ──────────────────────────────────────────────────────────────
const COLOR_PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f59e0b", "#10b981", "#3b82f6", "#06b6d4",
  "#84cc16", "#f97316", "#14b8a6", "#94a3b8",
];

// ─── Input style — guarantees white text in any portal/dialog context ───────────
const INPUT_STYLE: React.CSSProperties = {
  color: "#ffffff",
  backgroundColor: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "14px",
  lineHeight: "1.5",
  outline: "none",
  width: "100%",
  caretColor: "#a5b4fc",
  transition: "border-color 0.15s",
};

// ─── Color picker ───────────────────────────────────────────────────────────────
function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full transition-all duration-150 focus:outline-none"
          style={{
            backgroundColor: c,
            transform: value === c ? "scale(1.2)" : "scale(1)",
            boxShadow:
              value === c
                ? `0 0 0 2px #1e1e2e, 0 0 0 4px ${c}`
                : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Live preview badge ─────────────────────────────────────────────────────────
function PreviewBadge({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-white/80">{name || "Pratinjau nama…"}</span>
    </div>
  );
}

// ─── Edit panel ────────────────────────────────────────────────────────────────
function EditPanel({
  cat,
  onSave,
  onCancel,
}: {
  cat: Category;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color);
  const canSave = name.trim().length > 0;

  return (
    <div className="rounded-xl bg-white/5 border border-indigo-500/20 p-4 space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Nama Kategori
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSave) onSave(name.trim(), color);
            if (e.key === "Escape") onCancel();
          }}
          style={INPUT_STYLE}
          autoFocus
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Pilih Warna
        </label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* Preview + actions */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
        <PreviewBadge name={name} color={color} />
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Batal
          </button>
          <button
            type="button"
            onClick={() => canSave && onSave(name.trim(), color)}
            disabled={!canSave}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add panel ─────────────────────────────────────────────────────────────────
function AddPanel({ onAdd }: { onAdd: (name: string, color: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const canAdd = name.trim().length > 0;

  function handleAdd() {
    if (!canAdd) return;
    onAdd(name.trim(), color);
    setName("");
    setColor(COLOR_PALETTE[0]);
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Tambah kategori baru
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-indigo-950/50 border border-indigo-500/25 p-4 space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wide">
          Nama Kategori Baru
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") setExpanded(false);
          }}
          placeholder="Contoh: Transportasi, Pajak, Asuransi…"
          style={{
            ...INPUT_STYLE,
            borderColor: "rgba(99,102,241,0.4)",
          }}
          autoFocus
        />
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wide">
          Pilih Warna
        </label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* Preview + actions */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-indigo-500/10">
        <PreviewBadge name={name} color={color} />
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Batal
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main modal ─────────────────────────────────────────────────────────────────
export default function CategoryManagerModal() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setEditingId(null); }}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 gap-1.5"
          >
            <Settings className="w-4 h-4" />
            Kelola Kategori
          </Button>
        }
      />

      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Kelola Kategori
          </DialogTitle>
        </DialogHeader>

        <p className="text-slate-500 text-xs -mt-1 mb-1">
          {categories.length} kategori terdaftar &nbsp;·&nbsp; Hover baris untuk edit atau hapus
        </p>

        {/* List */}
        <div className="space-y-0.5 max-h-60 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-1">
          {categories.map((cat) =>
            editingId === cat.id ? (
              <EditPanel
                key={cat.id}
                cat={cat}
                onSave={(name, color) => {
                  updateCategory(cat.id, name, color);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 group transition-colors cursor-default"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-sm text-white">{cat.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setEditingId(cat.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => categories.length > 1 && deleteCategory(cat.id)}
                    disabled={categories.length <= 1}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={categories.length <= 1 ? "Minimal 1 kategori tersisa" : "Hapus"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Add new */}
        <AddPanel onAdd={addCategory} />
      </DialogContent>
    </Dialog>
  );
}
