/**
 * Fonctions de génération des sections PDF pour les rapports
 */

import type { ReportData } from '../../types/reports';
import {
  REPORT_COLORS,
  TYPE_COLORS,
  formatDuration,
  formatDistance,
  formatNumber,
} from '../reportConfig';
import {
  type PdfContext,
  checkNewPage,
  drawRect,
  drawSectionTitle,
  drawMetricCard,
  drawProgressBar,
} from '../pdfHelpers';

export function drawSummarySection(
  ctx: PdfContext,
  report: ReportData,
  contentWidth: number,
  margin: number
): void {
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

export function drawZonesSection(
  ctx: PdfContext,
  report: ReportData,
  contentWidth: number,
  margin: number
): void {
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

export function drawPolarizationSection(
  ctx: PdfContext,
  report: ReportData,
  contentWidth: number,
  margin: number
): void {
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

export function drawTrainingLoadSection(
  ctx: PdfContext,
  report: ReportData,
  contentWidth: number,
  margin: number
): void {
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

export function drawTopActivitiesSection(
  ctx: PdfContext,
  report: ReportData,
  contentWidth: number,
  margin: number
): void {
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

export function drawRecordsSection(
  ctx: PdfContext,
  report: ReportData,
  margin: number,
  pageWidth: number
): void {
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

export function drawTypeDistributionSection(
  ctx: PdfContext,
  report: ReportData,
  margin: number,
  pageWidth: number
): void {
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
