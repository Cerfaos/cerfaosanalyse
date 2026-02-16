/**
 * Graphique d'évolution de la charge d'entraînement
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import type { TrainingLoadData } from "../../types/trainingLoad";
import { formatDate } from "../../types/trainingLoad";

interface LoadChartProps {
  history: TrainingLoadData[];
  period: string;
}

export function LoadChart({ history, period }: LoadChartProps) {
  return (
    <div className="glass-panel p-6 border">
      <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast mb-2 flex items-center gap-2">
        <span>📊</span> Évolution sur {period} jours
      </h3>
      <p className="text-sm text-text-muted mb-4">
        Suivez l'évolution de votre forme (CTL), fatigue (ATL) et équilibre (TSB) dans le temps.
      </p>
      <div className="h-80 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={320}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-disabled)" strokeOpacity={0.5} />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--text-tertiary)" />
            <YAxis stroke="var(--text-tertiary)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-deep)",
                border: "1px solid var(--brand-primary-subtle)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: "bold", marginBottom: "8px" }}
              itemStyle={{ color: "var(--text-tertiary)" }}
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
              }
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  "CTL (Forme)": `${value} - Votre niveau de forme`,
                  "ATL (Fatigue)": `${value} - Votre niveau de fatigue`,
                  "TSB (Équilibre)": `${value > 0 ? "+" : ""}${value} - ${value > 5 ? "Frais" : value < -10 ? "Fatigué" : "Équilibré"}`,
                };
                return [labels[name] || value, name];
              }}
            />
            <Legend wrapperStyle={{ color: "var(--text-tertiary)" }} />
            <ReferenceLine
              y={0}
              stroke="var(--brand-primary)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: "Équilibre", fill: "var(--brand-primary)", fontSize: 10 }}
            />
            <ReferenceLine y={-10} stroke="var(--metric-alert)" strokeDasharray="2 2" strokeOpacity={0.3} />
            <ReferenceLine y={5} stroke="var(--brand-secondary)" strokeDasharray="2 2" strokeOpacity={0.3} />
            <Line type="monotone" dataKey="ctl" stroke="var(--brand-secondary)" name="CTL (Forme)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="atl" stroke="var(--metric-alert)" name="ATL (Fatigue)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="tsb" stroke="var(--brand-primary)" name="TSB (Équilibre)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-border-base/30 text-xs text-text-muted">
        <strong>Astuce de lecture :</strong> Quand la courbe CTL (bleue) monte, vous progressez. Quand TSB (verte) descend sous -10,
        pensez à récupérer. La zone optimale pour progresser est quand TSB oscille entre -10 et +5.
      </div>
    </div>
  );
}
