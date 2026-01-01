import { useEffect, useState } from "react";
import api from "../services/api";

interface FatigueAnalysis {
  status: "fresh" | "normal" | "tired" | "overreached" | "critical";
  riskLevel: number;
  ctlTrend: number;
  atlTrend: number;
  tsbTrend: number;
  recommendations: string[];
}

const statusConfig = {
  fresh: {
    label: "Frais",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: "🔋",
  },
  normal: {
    label: "Optimal",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: "✨",
  },
  tired: {
    label: "Fatigué",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: "😫",
  },
  overreached: {
    label: "Surentraînement",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    icon: "⚠️",
  },
  critical: {
    label: "Critique",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: "🚑",
  },
};

function TrendMetric({
  label,
  value,
  color,
  isBalance = false,
}: {
  label: string;
  value: number;
  color: string;
  isBalance?: boolean;
}) {
  const formattedValue = isBalance
    ? value > 0
      ? `+${value.toFixed(2)}`
      : value.toFixed(2)
    : value.toFixed(2);

  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{formattedValue}</span>
    </div>
  );
}

export default function FatigueCard() {
  const [analysis, setAnalysis] = useState<FatigueAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFatigue = async () => {
      try {
        const response = await api.get("/api/analytics/fatigue");
        setAnalysis(response.data.data);
      } catch (error) {
        // Silencieux
      } finally {
        setLoading(false);
      }
    };

    fetchFatigue();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-6 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const config = statusConfig[analysis.status];

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            État de forme
          </p>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            {config.label} <span className="text-2xl">{config.icon}</span>
          </h3>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}
        >
          Risque: {analysis.riskLevel}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <TrendMetric
          label="Forme (CTL)"
          value={analysis.ctlTrend}
          color="text-blue-400"
        />
        <TrendMetric
          label="Fatigue (ATL)"
          value={analysis.atlTrend}
          color="text-purple-400"
        />
        <TrendMetric
          label="Équilibre (TSB)"
          value={analysis.tsbTrend}
          color="text-emerald-400"
          isBalance
        />
      </div>

      <div className="space-y-4 flex-1">
        {analysis.recommendations.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-300 mb-2">
              Recommandations
            </p>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-400 flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
