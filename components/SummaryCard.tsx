import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "indigo" | "emerald" | "rose";
  prefix?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

const colorMap = {
  indigo: {
    icon: "from-indigo-500 to-violet-600",
    badge: "bg-indigo-500/10 border-indigo-500/20",
    glow: "shadow-indigo-500/10",
  },
  emerald: {
    icon: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500/10 border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  rose: {
    icon: "from-rose-500 to-pink-600",
    badge: "bg-rose-500/10 border-rose-500/20",
    glow: "shadow-rose-500/10",
  },
};

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: SummaryCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={`relative bg-slate-800/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl ${styles.glow} hover:scale-[1.01] transition-transform duration-200`}
    >
      {/* Subtle glow bg */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br opacity-5 ${styles.icon}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {formatIDR(Math.abs(value))}
          </p>
          {value < 0 && (
            <span className="text-rose-400 text-xs">Saldo negatif</span>
          )}
          {trend && (
            <p
              className={`text-xs mt-1.5 ${
                trend.positive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% bulan ini
            </p>
          )}
        </div>
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${styles.icon} shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
