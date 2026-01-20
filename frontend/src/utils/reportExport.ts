import { jsPDF } from 'jspdf';
import type { ReportData } from '../types/reports';
import {
  REPORT_COLORS,
  TYPE_COLORS,
  PDF_DIMENSIONS,
  formatDuration,
  formatDistance,
  formatDate,
  formatNumber,
  formatGeneratedDate,
  formatFullDate,
} from './reportConfig';
import {
  type PdfContext,
  checkNewPage,
  drawRect,
  drawSectionTitle,
  drawMetricCard,
  drawProgressBar,
  drawPdfHeader,
  drawPdfFooter,
} from './pdfHelpers';

// Re-export des formatters pour compatibilité
export { formatDuration, formatDistance, formatDate };

// ============================================================================
// Export PDF
// ============================================================================

export function exportReportToPdf(report: ReportData, filename: string): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ctx: PdfContext = { pdf, y: PDF_DIMENSIONS.margin };
  const { margin, contentWidth, pageWidth } = PDF_DIMENSIONS;

  // En-tête
  drawPdfHeader(
    ctx,
    report.period.label,
    `Du ${formatDate(report.period.startDate)} au ${formatDate(report.period.endDate)}`
  );

  if (report.summary.totalActivities === 0) {
    pdf.setTextColor(REPORT_COLORS.textSecondary);
    pdf.setFontSize(14);
    pdf.text('Aucune activité enregistrée pour cette période.', pageWidth / 2, ctx.y + 20, { align: 'center' });
    pdf.save(filename);
    return;
  }

  // Résumé
  drawSummarySection(ctx, report, contentWidth, margin);

  // Zones cardiaques
  drawZonesSection(ctx, report, contentWidth, margin);

  // Polarisation
  drawPolarizationSection(ctx, report, contentWidth, margin);

  // Charge d'entraînement
  drawTrainingLoadSection(ctx, report, contentWidth, margin);

  // Top activités
  drawTopActivitiesSection(ctx, report, contentWidth, margin, pageWidth);

  // Records
  drawRecordsSection(ctx, report, margin, pageWidth);

  // Répartition par type
  drawTypeDistributionSection(ctx, report, margin, pageWidth);

  // Footer
  drawPdfFooter(pdf, formatGeneratedDate());

  pdf.save(filename);
}

function drawSummarySection(ctx: PdfContext, report: ReportData, contentWidth: number, margin: number): void {
  checkNewPage(ctx, 50);
  drawSectionTitle(ctx, 'Résumé');

  const summaryData = [
    { label: 'Activités', value: report.summary.totalActivities.toString(), unit: '' },
    { label: 'Distance', value: formatDistance(report.summary.totalDistance), unit: '' },
    { label: 'Durée', value: formatDuration(report.summary.totalDuration), unit: '' },
    { label: 'Dénivelé', value: formatNumber(report.summary.totalElevation), unit: 'm' },
    { label: 'Calories', value: formatNumber(report.summary.totalCalories), unit: 'kcal' },
    { label: 'TRIMP', value: formatNumber(report.summary.totalTrimp), unit: 'pts' },
    { label: 'FC Moyenne', value: report.summary.averageHeartRate?.toString() || '-', unit: report.summary.averageHeartRate ? 'bpm' : '' },
    { label: 'Vitesse Moy.', value: report.summary.averageSpeed?.toString() || '-', unit: report.summary.averageSpeed ? 'km/h' : '' },
  ];

  const cardWidth = (contentWidth - 15) / 4;
  const cardHeight = 18;

  summaryData.forEach((item, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const x = margin + col * (cardWidth + 5);
    const cardY = ctx.y + row * (cardHeight + 4);
    const valueText = item.unit ? `${item.value} ${item.unit}` : item.value;
    drawMetricCard(ctx.pdf, x, cardY, cardWidth, cardHeight, valueText, item.label);
  });

  ctx.y += 2 * (cardHeight + 4) + 10;
}

function drawZonesSection(ctx: PdfContext, report: ReportData, contentWidth: number, margin: number): void {
  checkNewPage(ctx, 45);
  drawSectionTitle(ctx, 'Répartition des Zones Cardiaques');

  const zoneWidth = (contentWidth - 20) / 5;
  const zoneHeight = 30;

  report.zoneDistribution.forEach((zone, index) => {
    const x = margin + index * (zoneWidth + 5);

    drawRect(ctx.pdf, x, ctx.y, zoneWidth, zoneHeight, REPORT_COLORS.bgCard);

    ctx.pdf.setFillColor(zone.color);
    ctx.pdf.circle(x + 8, ctx.y + 8, 3, 'F');

    ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
    ctx.pdf.setFontSize(8);
    ctx.pdf.setFont('helvetica', 'bold');
    ctx.pdf.text(`Z${zone.zone}`, x + 14, ctx.y + 9);

    ctx.pdf.setTextColor(zone.color);
    ctx.pdf.setFontSize(11);
    ctx.pdf.text(`${zone.percentage.toFixed(1)}%`, x + zoneWidth / 2, ctx.y + 18, { align: 'center' });

    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.setFontSize(7);
    ctx.pdf.setFont('helvetica', 'normal');
    ctx.pdf.text(formatDuration(zone.seconds), x + zoneWidth / 2, ctx.y + 25, { align: 'center' });
  });

  ctx.y += zoneHeight + 12;
}

function drawPolarizationSection(ctx: PdfContext, report: ReportData, contentWidth: number, margin: number): void {
  checkNewPage(ctx, 50);
  drawSectionTitle(ctx, 'Index de Polarisation 80/10/10');

  const scoreSize = 35;
  const scoreX = margin + 25;
  const scoreY = ctx.y + scoreSize / 2;

  ctx.pdf.setFillColor(REPORT_COLORS.primary);
  ctx.pdf.circle(scoreX, scoreY, scoreSize / 2, 'F');

  ctx.pdf.setTextColor(REPORT_COLORS.bgDark);
  ctx.pdf.setFontSize(16);
  ctx.pdf.setFont('helvetica', 'bold');
  ctx.pdf.text(`${report.polarization.score.toFixed(0)}%`, scoreX, scoreY + 2, { align: 'center' });

  ctx.pdf.setFontSize(7);
  ctx.pdf.setFont('helvetica', 'normal');
  ctx.pdf.text('Score', scoreX, scoreY + 8, { align: 'center' });

  const barStartX = margin + 60;
  const barWidth = contentWidth - 70;
  const barHeight = 8;
  const intensities = [
    { label: 'Endurance (Z1-Z2)', value: report.polarization.percentages.low, target: 80, color: REPORT_COLORS.cyan },
    { label: 'Tempo (Z3)', value: report.polarization.percentages.moderate, target: 10, color: REPORT_COLORS.yellow },
    { label: 'Haute Intensité (Z4-Z5)', value: report.polarization.percentages.high, target: 10, color: REPORT_COLORS.red },
  ];

  intensities.forEach((item, index) => {
    const barY = ctx.y + index * 14;

    ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
    ctx.pdf.setFontSize(8);
    ctx.pdf.setFont('helvetica', 'normal');
    ctx.pdf.text(item.label, barStartX, barY);

    ctx.pdf.setTextColor(item.color);
    ctx.pdf.text(`${item.value.toFixed(1)}%`, barStartX + barWidth, barY, { align: 'right' });

    drawProgressBar(ctx.pdf, barStartX, barY + 2, barWidth, barHeight, item.value, item.color, item.target);
  });

  ctx.y += scoreSize + 8;
}

function drawTrainingLoadSection(ctx: PdfContext, report: ReportData, contentWidth: number, margin: number): void {
  checkNewPage(ctx, 45);
  drawSectionTitle(ctx, "Charge d'Entraînement");

  const loadCardWidth = (contentWidth - 10) / 3;
  const loadCardHeight = 25;
  const loadData = [
    { label: 'Forme (CTL)', value: report.trainingLoad.endCtl, change: report.trainingLoad.ctlChange, color: REPORT_COLORS.blue },
    { label: 'Fatigue (ATL)', value: report.trainingLoad.endAtl, change: report.trainingLoad.atlChange, color: REPORT_COLORS.purple },
    { label: 'Fraîcheur (TSB)', value: report.trainingLoad.endCtl - report.trainingLoad.endAtl, change: null, color: REPORT_COLORS.green },
  ];

  loadData.forEach((item, index) => {
    const x = margin + index * (loadCardWidth + 5);

    drawRect(ctx.pdf, x, ctx.y, loadCardWidth, loadCardHeight, REPORT_COLORS.bgCard);

    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.setFontSize(8);
    ctx.pdf.text(item.label, x + loadCardWidth / 2, ctx.y + 7, { align: 'center' });

    ctx.pdf.setTextColor(item.color);
    ctx.pdf.setFontSize(14);
    ctx.pdf.setFont('helvetica', 'bold');
    ctx.pdf.text(item.value.toFixed(1), x + loadCardWidth / 2, ctx.y + 16, { align: 'center' });

    if (item.change !== null) {
      ctx.pdf.setTextColor(item.change >= 0 ? REPORT_COLORS.green : REPORT_COLORS.red);
      ctx.pdf.setFontSize(7);
      ctx.pdf.setFont('helvetica', 'normal');
      ctx.pdf.text(`${item.change >= 0 ? '+' : ''}${item.change.toFixed(1)}`, x + loadCardWidth / 2, ctx.y + 22, { align: 'center' });
    }
  });

  ctx.y += loadCardHeight + 12;
}

function drawTopActivitiesSection(ctx: PdfContext, report: ReportData, contentWidth: number, margin: number, _pageWidth: number): void {
  const hasTopActivities = report.topActivities.byDistance.length > 0 || report.topActivities.byDuration.length > 0;
  if (!hasTopActivities) return;

  checkNewPage(ctx, 50);
  drawSectionTitle(ctx, 'Top Activités');

  const colWidth = (contentWidth - 5) / 2;

  if (report.topActivities.byDistance.length > 0) {
    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.setFontSize(9);
    ctx.pdf.setFont('helvetica', 'normal');
    ctx.pdf.text('Plus longue distance', margin, ctx.y);

    report.topActivities.byDistance.slice(0, 3).forEach((activity, index) => {
      const actY = ctx.y + 5 + index * 8;
      ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
      ctx.pdf.setFontSize(8);
      ctx.pdf.text(`${index + 1}.`, margin, actY);
      ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
      ctx.pdf.text(activity.type, margin + 8, actY);
      ctx.pdf.setTextColor(REPORT_COLORS.primary);
      ctx.pdf.setFont('helvetica', 'bold');
      ctx.pdf.text(formatDistance(activity.distance), margin + colWidth - 5, actY, { align: 'right' });
      ctx.pdf.setFont('helvetica', 'normal');
    });
  }

  if (report.topActivities.byDuration.length > 0) {
    const col2X = margin + colWidth + 5;
    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.setFontSize(9);
    ctx.pdf.text('Plus longue durée', col2X, ctx.y);

    report.topActivities.byDuration.slice(0, 3).forEach((activity, index) => {
      const actY = ctx.y + 5 + index * 8;
      ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
      ctx.pdf.setFontSize(8);
      ctx.pdf.text(`${index + 1}.`, col2X, actY);
      ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
      ctx.pdf.text(activity.type, col2X + 8, actY);
      ctx.pdf.setTextColor(REPORT_COLORS.primary);
      ctx.pdf.setFont('helvetica', 'bold');
      ctx.pdf.text(formatDuration(activity.duration), col2X + colWidth - 5, actY, { align: 'right' });
      ctx.pdf.setFont('helvetica', 'normal');
    });
  }

  ctx.y += 32;
}

function drawRecordsSection(ctx: PdfContext, report: ReportData, margin: number, pageWidth: number): void {
  const hasRecords = report.records.new.length > 0 || report.records.improved.length > 0;
  if (!hasRecords) return;

  checkNewPage(ctx, 40);
  drawSectionTitle(ctx, `Records Personnels (${report.records.new.length + report.records.improved.length})`);

  const allRecords = [
    ...report.records.new.map(r => ({ ...r, isNew: true })),
    ...report.records.improved.map(r => ({ ...r, isNew: false })),
  ];

  allRecords.slice(0, 5).forEach((record, index) => {
    const recordY = ctx.y + index * 8;

    ctx.pdf.setFillColor(record.isNew ? REPORT_COLORS.green : REPORT_COLORS.blue);
    ctx.pdf.roundedRect(margin, recordY - 3, 18, 5, 1, 1, 'F');
    ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
    ctx.pdf.setFontSize(6);
    ctx.pdf.text(record.isNew ? 'Nouveau' : `+${record.improvement?.toFixed(1)}%`, margin + 9, recordY, { align: 'center' });

    ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
    ctx.pdf.setFontSize(8);
    ctx.pdf.setFont('helvetica', 'normal');
    ctx.pdf.text(record.recordTypeName, margin + 22, recordY);

    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.text(record.activityType, margin + 80, recordY);

    ctx.pdf.setTextColor(REPORT_COLORS.primary);
    ctx.pdf.setFont('helvetica', 'bold');
    const valueText = `${record.value.toFixed(record.unit === 'km/h' || record.unit === 'km' ? 1 : 0)} ${record.unit}`;
    ctx.pdf.text(valueText, pageWidth - margin, recordY, { align: 'right' });
    ctx.pdf.setFont('helvetica', 'normal');
  });

  ctx.y += Math.min(allRecords.length, 5) * 8 + 10;
}

function drawTypeDistributionSection(ctx: PdfContext, report: ReportData, margin: number, pageWidth: number): void {
  if (report.byType.length === 0) return;

  checkNewPage(ctx, 50);
  drawSectionTitle(ctx, 'Répartition par Type');

  report.byType.forEach((type, index) => {
    const typeY = ctx.y + index * 10;
    const color = TYPE_COLORS[index % TYPE_COLORS.length];

    ctx.pdf.setFillColor(color);
    ctx.pdf.circle(margin + 3, typeY - 1, 2, 'F');

    ctx.pdf.setTextColor(REPORT_COLORS.textPrimary);
    ctx.pdf.setFontSize(9);
    ctx.pdf.setFont('helvetica', 'bold');
    ctx.pdf.text(type.type, margin + 10, typeY);

    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.setFontSize(7);
    ctx.pdf.setFont('helvetica', 'normal');
    ctx.pdf.text(`${type.indoor} int. / ${type.outdoor} ext.`, margin + 50, typeY);

    ctx.pdf.setTextColor(REPORT_COLORS.primary);
    ctx.pdf.setFontSize(9);
    ctx.pdf.setFont('helvetica', 'bold');
    ctx.pdf.text(`${type.count} sorties`, margin + 100, typeY);

    ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
    ctx.pdf.setFontSize(8);
    ctx.pdf.setFont('helvetica', 'normal');
    ctx.pdf.text(formatDistance(type.distance), pageWidth - margin, typeY, { align: 'right' });
  });

  ctx.y += report.byType.length * 10 + 8;

  const indoorPct = report.activitiesCount.total > 0 ? Math.round((report.activitiesCount.indoor / report.activitiesCount.total) * 100) : 0;
  const outdoorPct = 100 - indoorPct;

  ctx.pdf.setFillColor(REPORT_COLORS.green);
  ctx.pdf.circle(margin + 50, ctx.y, 2, 'F');
  ctx.pdf.setTextColor(REPORT_COLORS.textSecondary);
  ctx.pdf.setFontSize(8);
  ctx.pdf.text(`Extérieur: ${report.activitiesCount.outdoor} (${outdoorPct}%)`, margin + 55, ctx.y + 1);

  ctx.pdf.setFillColor(REPORT_COLORS.purple);
  ctx.pdf.circle(margin + 120, ctx.y, 2, 'F');
  ctx.pdf.text(`Intérieur: ${report.activitiesCount.indoor} (${indoorPct}%)`, margin + 125, ctx.y + 1);
}

// ============================================================================
// Export HTML
// ============================================================================

export function exportReportToHtml(report: ReportData, filename: string): void {
  const html = generateHtmlReport(report);

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateHtmlReport(report: ReportData): string {
  const generatedAt = formatFullDate();

  const cssStyles = `
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

  const summaryHtml = report.summary.totalActivities === 0
    ? '<div class="empty-message"><p>Aucune activité enregistrée pour cette période.</p></div>'
    : generateContentHtml(report);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport - ${report.period.label}</title>
  <style>${cssStyles}</style>
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

function generateContentHtml(report: ReportData): string {
  const pol = report.polarization;
  const tl = report.trainingLoad;

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
    </div>

    <div class="section">
      <h2 class="section-title">Répartition des Zones Cardiaques</h2>
      <div class="zones-grid">
        ${report.zoneDistribution.map(zone => `<div class="zone-card"><div class="zone-name"><span class="zone-indicator" style="background-color: ${zone.color}"></span>${zone.name}</div><div class="zone-stats"><div>${zone.percentage.toFixed(1)}%</div><div>${formatDuration(zone.seconds)}</div></div></div>`).join('')}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Index de Polarisation 80/10/10</h2>
      <div class="polarization-container">
        <div class="score-circle"><div class="score-value">${pol.score.toFixed(0)}%</div><div class="score-label">Score</div></div>
        <div class="intensity-bars">
          <div class="intensity-bar"><div class="intensity-header"><span>Endurance (Z1-Z2)</span><span>${pol.percentages.low.toFixed(1)}% / ${pol.target.low}%</span></div><div class="intensity-track"><div class="intensity-fill" style="width: ${Math.min(pol.percentages.low, 100)}%; background-color: #0EA5E9;"></div><div class="intensity-target" style="left: ${pol.target.low}%;"></div></div></div>
          <div class="intensity-bar"><div class="intensity-header"><span>Tempo (Z3)</span><span>${pol.percentages.moderate.toFixed(1)}% / ${pol.target.moderate}%</span></div><div class="intensity-track"><div class="intensity-fill" style="width: ${Math.min(pol.percentages.moderate * 2, 100)}%; background-color: #FACC15;"></div><div class="intensity-target" style="left: ${pol.target.moderate * 2}%;"></div></div></div>
          <div class="intensity-bar"><div class="intensity-header"><span>Haute Intensité (Z4-Z5)</span><span>${pol.percentages.high.toFixed(1)}% / ${pol.target.high}%</span></div><div class="intensity-track"><div class="intensity-fill" style="width: ${Math.min(pol.percentages.high * 2, 100)}%; background-color: #EF4444;"></div><div class="intensity-target" style="left: ${pol.target.high * 2}%;"></div></div></div>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary); font-style: italic;">${pol.message}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Charge d'Entraînement</h2>
      <div class="training-load-grid">
        <div class="load-card"><div class="metric-label">Forme (CTL)</div><div class="load-value" style="color: #3B82F6;">${tl.endCtl.toFixed(1)}</div><div class="load-change ${tl.ctlChange >= 0 ? 'positive' : 'negative'}">${tl.ctlChange >= 0 ? '+' : ''}${tl.ctlChange.toFixed(1)}</div></div>
        <div class="load-card"><div class="metric-label">Fatigue (ATL)</div><div class="load-value" style="color: #A855F7;">${tl.endAtl.toFixed(1)}</div><div class="load-change ${tl.atlChange >= 0 ? 'negative' : 'positive'}">${tl.atlChange >= 0 ? '+' : ''}${tl.atlChange.toFixed(1)}</div></div>
        <div class="load-card"><div class="metric-label">Fraîcheur (TSB)</div><div class="load-value" style="color: #22C55E;">${(tl.endCtl - tl.endAtl).toFixed(1)}</div><div class="load-change" style="color: var(--text-secondary);">CTL - ATL</div></div>
      </div>
    </div>

    ${generateRecordsHtml(report)}
    ${generateTypesHtml(report)}
  `;
}

function generateRecordsHtml(report: ReportData): string {
  if (report.records.new.length === 0 && report.records.improved.length === 0) return '';

  return `
    <div class="section">
      <h2 class="section-title">Records Personnels (${report.records.new.length + report.records.improved.length})</h2>
      <table>
        <thead><tr><th>Type</th><th>Record</th><th>Activité</th><th>Valeur</th><th>Date</th></tr></thead>
        <tbody>
          ${report.records.new.map(r => `<tr><td><span class="badge badge-new">Nouveau</span></td><td>${r.recordTypeName}</td><td>${r.activityType}</td><td><strong>${r.value.toFixed(r.unit === 'km/h' || r.unit === 'km' ? 1 : 0)} ${r.unit}</strong></td><td>${formatDate(r.achievedAt)}</td></tr>`).join('')}
          ${report.records.improved.map(r => `<tr><td><span class="badge badge-improved">+${r.improvement?.toFixed(1)}%</span></td><td>${r.recordTypeName}</td><td>${r.activityType}</td><td><strong>${r.value.toFixed(r.unit === 'km/h' || r.unit === 'km' ? 1 : 0)} ${r.unit}</strong></td><td>${formatDate(r.achievedAt)}</td></tr>`).join('')}
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
        ${report.byType.map((t, i) => `<div class="type-card"><div class="type-info"><div class="type-color" style="background-color: ${colors[i % colors.length]}"></div><div><div class="type-name">${t.type}</div><div class="type-detail">${t.indoor} int. / ${t.outdoor} ext.</div></div></div><div class="type-stats"><div class="type-count">${t.count} sorties</div><div class="type-detail">${formatDistance(t.distance)}</div></div></div>`).join('')}
      </div>
      <div class="indoor-outdoor">
        <div class="io-stat"><div class="io-dot outdoor"></div><span>Extérieur: ${report.activitiesCount.outdoor} (${outdoorPct}%)</span></div>
        <div class="io-stat"><div class="io-dot indoor"></div><span>Intérieur: ${report.activitiesCount.indoor} (${indoorPct}%)</span></div>
      </div>
    </div>`;
}
