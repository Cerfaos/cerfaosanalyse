/**
 * Génération de rapports HTML
 */

import type { ReportData } from '../../types/reports';
import { formatDuration, formatDistance, formatDate, formatNumber, formatFullDate } from '../reportConfig';

const CSS_STYLES = `
  :root { --primary: #8BC34A; --primary-dark: #689F38; --bg-dark: #0c1017; --bg-card: rgba(255, 255, 255, 0.05); --text-primary: #ffffff; --text-secondary: #9CA3AF; --border: rgba(255, 255, 255, 0.1); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, var(--bg-dark) 0%, #0d2520 100%); color: var(--text-primary); line-height: 1.6; min-height: 100vh; padding: 2rem; }
  .container { max-width: 1000px; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 3px solid var(--primary); }
  .header h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 0.5rem; }
  .header .subtitle { color: var(--text-secondary); font-size: 1.1rem; }
  .section { background: var(--bg-card); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--border); }
  .section-title { font-size: 1.3rem; color: var(--primary); margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  @media (max-width: 768px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
  .metric-card { background: rgba(255, 255, 255, 0.03); border-radius: 0.75rem; padding: 1.25rem; text-align: center; border: 1px solid var(--border); }
  .metric-value { font-size: 1.75rem; font-weight: 700; color: var(--primary); }
  .metric-label { font-size: 0.875rem; color: var(--text-secondary); }
  .zones-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; }
  @media (max-width: 768px) { .zones-grid { grid-template-columns: repeat(2, 1fr); } }
  .zone-card { background: rgba(255, 255, 255, 0.03); border-radius: 0.5rem; padding: 1rem; text-align: center; border: 1px solid var(--border); }
  .zone-indicator { width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 0.5rem; }
  .zone-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .zone-stats { font-size: 0.8rem; color: var(--text-secondary); }
  .polarization-container { display: grid; grid-template-columns: 200px 1fr; gap: 2rem; align-items: center; }
  @media (max-width: 768px) { .polarization-container { grid-template-columns: 1fr; } }
  .score-circle { width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; }
  .score-value { font-size: 2.5rem; font-weight: 700; color: var(--bg-dark); }
  .score-label { font-size: 0.75rem; color: var(--bg-dark); opacity: 0.8; }
  .intensity-bar { margin-bottom: 1rem; }
  .intensity-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
  .intensity-track { height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden; position: relative; }
  .intensity-fill { height: 100%; border-radius: 6px; }
  .intensity-target { position: absolute; top: 0; width: 2px; height: 100%; background: white; opacity: 0.5; }
  .training-load-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .load-card { background: rgba(255, 255, 255, 0.03); border-radius: 0.75rem; padding: 1rem; text-align: center; border: 1px solid var(--border); }
  .load-value { font-size: 1.5rem; font-weight: 700; }
  .load-change { font-size: 0.875rem; margin-top: 0.25rem; }
  .load-change.positive { color: #22C55E; }
  .load-change.negative { color: #EF4444; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { color: var(--primary); font-weight: 600; font-size: 0.875rem; }
  .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
  .badge-new { background: rgba(34, 197, 94, 0.2); color: #22C55E; }
  .badge-improved { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }
  .type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
  @media (max-width: 768px) { .type-grid { grid-template-columns: 1fr; } }
  .type-card { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); border-radius: 0.75rem; padding: 1rem; border: 1px solid var(--border); }
  .type-info { display: flex; align-items: center; gap: 0.75rem; }
  .type-color { width: 12px; height: 12px; border-radius: 50%; }
  .type-name { font-weight: 600; }
  .type-detail { font-size: 0.8rem; color: var(--text-secondary); }
  .type-stats { text-align: right; }
  .type-count { font-weight: 600; color: var(--primary); }
  .indoor-outdoor { display: flex; gap: 2rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); justify-content: center; }
  .io-stat { display: flex; align-items: center; gap: 0.5rem; }
  .io-dot { width: 10px; height: 10px; border-radius: 50%; }
  .io-dot.outdoor { background: #22C55E; }
  .io-dot.indoor { background: #A855F7; }
  .footer { text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border); color: var(--text-secondary); }
  .footer-logo { font-size: 1.25rem; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem; }
  .empty-message { text-align: center; padding: 3rem; color: var(--text-secondary); }
`;

function generateSummaryHtml(report: ReportData): string {
  return `
    <div class="section">
      <h2 class="section-title">Résumé</h2>
      <div class="metrics-grid">
        <div class="metric-card"><div class="metric-value">${report.summary.totalActivities}</div><div class="metric-label">Activités</div></div>
        <div class="metric-card"><div class="metric-value">${formatDistance(report.summary.totalDistance)}</div><div class="metric-label">Distance</div></div>
        <div class="metric-card"><div class="metric-value">${formatDuration(report.summary.totalDuration)}</div><div class="metric-label">Durée</div></div>
        <div class="metric-card"><div class="metric-value">${formatNumber(report.summary.totalElevation)} m</div><div class="metric-label">Dénivelé</div></div>
        <div class="metric-card"><div class="metric-value">${formatNumber(report.summary.totalCalories)}</div><div class="metric-label">Calories</div></div>
        <div class="metric-card"><div class="metric-value">${formatNumber(report.summary.totalTrimp)}</div><div class="metric-label">TRIMP</div></div>
        <div class="metric-card"><div class="metric-value">${report.summary.averageHeartRate || '-'} ${report.summary.averageHeartRate ? 'bpm' : ''}</div><div class="metric-label">FC Moyenne</div></div>
        <div class="metric-card"><div class="metric-value">${report.summary.averageSpeed || '-'} ${report.summary.averageSpeed ? 'km/h' : ''}</div><div class="metric-label">Vitesse Moy.</div></div>
      </div>
    </div>`;
}

function generateZonesHtml(report: ReportData): string {
  return `
    <div class="section">
      <h2 class="section-title">Répartition des Zones Cardiaques</h2>
      <div class="zones-grid">
        ${report.zoneDistribution.map(zone => `
          <div class="zone-card">
            <div class="zone-name"><span class="zone-indicator" style="background-color: ${zone.color}"></span>${zone.name}</div>
            <div class="zone-stats"><div>${zone.percentage.toFixed(1)}%</div><div>${formatDuration(zone.seconds)}</div></div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

function generatePolarizationHtml(report: ReportData): string {
  const pol = report.polarization;
  return `
    <div class="section">
      <h2 class="section-title">Index de Polarisation 80/10/10</h2>
      <div class="polarization-container">
        <div class="score-circle"><div class="score-value">${pol.score.toFixed(0)}%</div><div class="score-label">Score</div></div>
        <div class="intensity-bars">
          <div class="intensity-bar">
            <div class="intensity-header"><span>Endurance (Z1-Z2)</span><span>${pol.percentages.low.toFixed(1)}% / ${pol.target.low}%</span></div>
            <div class="intensity-track"><div class="intensity-fill" style="width: ${Math.min(pol.percentages.low, 100)}%; background-color: #0EA5E9;"></div><div class="intensity-target" style="left: ${pol.target.low}%;"></div></div>
          </div>
          <div class="intensity-bar">
            <div class="intensity-header"><span>Tempo (Z3)</span><span>${pol.percentages.moderate.toFixed(1)}% / ${pol.target.moderate}%</span></div>
            <div class="intensity-track"><div class="intensity-fill" style="width: ${Math.min(pol.percentages.moderate * 2, 100)}%; background-color: #FACC15;"></div><div class="intensity-target" style="left: ${pol.target.moderate * 2}%;"></div></div>
          </div>
          <div class="intensity-bar">
            <div class="intensity-header"><span>Haute Intensité (Z4-Z5)</span><span>${pol.percentages.high.toFixed(1)}% / ${pol.target.high}%</span></div>
            <div class="intensity-track"><div class="intensity-fill" style="width: ${Math.min(pol.percentages.high * 2, 100)}%; background-color: #EF4444;"></div><div class="intensity-target" style="left: ${pol.target.high * 2}%;"></div></div>
          </div>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary); font-style: italic;">${pol.message}</p>
        </div>
      </div>
    </div>`;
}

function generateTrainingLoadHtml(report: ReportData): string {
  const tl = report.trainingLoad;
  return `
    <div class="section">
      <h2 class="section-title">Charge d'Entraînement</h2>
      <div class="training-load-grid">
        <div class="load-card">
          <div class="metric-label">Forme (CTL)</div>
          <div class="load-value" style="color: #3B82F6;">${tl.endCtl.toFixed(1)}</div>
          <div class="load-change ${tl.ctlChange >= 0 ? 'positive' : 'negative'}">${tl.ctlChange >= 0 ? '+' : ''}${tl.ctlChange.toFixed(1)}</div>
        </div>
        <div class="load-card">
          <div class="metric-label">Fatigue (ATL)</div>
          <div class="load-value" style="color: #A855F7;">${tl.endAtl.toFixed(1)}</div>
          <div class="load-change ${tl.atlChange >= 0 ? 'negative' : 'positive'}">${tl.atlChange >= 0 ? '+' : ''}${tl.atlChange.toFixed(1)}</div>
        </div>
        <div class="load-card">
          <div class="metric-label">Fraîcheur (TSB)</div>
          <div class="load-value" style="color: #22C55E;">${(tl.endCtl - tl.endAtl).toFixed(1)}</div>
          <div class="load-change" style="color: var(--text-secondary);">CTL - ATL</div>
        </div>
      </div>
    </div>`;
}

function generateRecordsHtml(report: ReportData): string {
  if (report.records.new.length === 0 && report.records.improved.length === 0) return '';

  return `
    <div class="section">
      <h2 class="section-title">Records Personnels (${report.records.new.length + report.records.improved.length})</h2>
      <table>
        <thead><tr><th>Type</th><th>Record</th><th>Activité</th><th>Valeur</th><th>Date</th></tr></thead>
        <tbody>
          ${report.records.new.map(r => `
            <tr>
              <td><span class="badge badge-new">Nouveau</span></td>
              <td>${r.recordTypeName}</td>
              <td>${r.activityType}</td>
              <td><strong>${r.value.toFixed(r.unit === 'km/h' || r.unit === 'km' ? 1 : 0)} ${r.unit}</strong></td>
              <td>${formatDate(r.achievedAt)}</td>
            </tr>
          `).join('')}
          ${report.records.improved.map(r => `
            <tr>
              <td><span class="badge badge-improved">+${r.improvement?.toFixed(1)}%</span></td>
              <td>${r.recordTypeName}</td>
              <td>${r.activityType}</td>
              <td><strong>${r.value.toFixed(r.unit === 'km/h' || r.unit === 'km' ? 1 : 0)} ${r.unit}</strong></td>
              <td>${formatDate(r.achievedAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function generateTypesHtml(report: ReportData): string {
  if (report.byType.length === 0) return '';

  const colors = ['#8BC34A', '#3B82F6', '#A855F7', '#F97316', '#EC4899', '#14B8A6', '#EAB308', '#6366F1'];
  const indoorPct = report.activitiesCount.total > 0 ? Math.round((report.activitiesCount.indoor / report.activitiesCount.total) * 100) : 0;
  const outdoorPct = 100 - indoorPct;

  return `
    <div class="section">
      <h2 class="section-title">Répartition par Type</h2>
      <div class="type-grid">
        ${report.byType.map((t, i) => `
          <div class="type-card">
            <div class="type-info">
              <div class="type-color" style="background-color: ${colors[i % colors.length]}"></div>
              <div>
                <div class="type-name">${t.type}</div>
                <div class="type-detail">${t.indoor} int. / ${t.outdoor} ext.</div>
              </div>
            </div>
            <div class="type-stats">
              <div class="type-count">${t.count} sorties</div>
              <div class="type-detail">${formatDistance(t.distance)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="indoor-outdoor">
        <div class="io-stat"><div class="io-dot outdoor"></div><span>Extérieur: ${report.activitiesCount.outdoor} (${outdoorPct}%)</span></div>
        <div class="io-stat"><div class="io-dot indoor"></div><span>Intérieur: ${report.activitiesCount.indoor} (${indoorPct}%)</span></div>
      </div>
    </div>`;
}

function generateContentHtml(report: ReportData): string {
  return `
    ${generateSummaryHtml(report)}
    ${generateZonesHtml(report)}
    ${generatePolarizationHtml(report)}
    ${generateTrainingLoadHtml(report)}
    ${generateRecordsHtml(report)}
    ${generateTypesHtml(report)}
  `;
}

export function generateHtmlReport(report: ReportData): string {
  const generatedAt = formatFullDate();

  const summaryHtml = report.summary.totalActivities === 0
    ? '<div class="empty-message"><p>Aucune activité enregistrée pour cette période.</p></div>'
    : generateContentHtml(report);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport - ${report.period.label}</title>
  <style>${CSS_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${report.period.label}</h1>
      <p class="subtitle">Du ${formatDate(report.period.startDate)} au ${formatDate(report.period.endDate)}</p>
    </div>
    ${summaryHtml}
    <div class="footer">
      <div class="footer-logo">Centre d'Analyse Cycliste</div>
      <p>Rapport généré le ${generatedAt}</p>
    </div>
  </div>
</body>
</html>`;
}
