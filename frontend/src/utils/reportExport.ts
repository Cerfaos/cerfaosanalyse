/**
 * Exports de rapports PDF et HTML
 */

import { jsPDF } from 'jspdf';
import type { ReportData } from '../types/reports';
import {
  REPORT_COLORS,
  PDF_DIMENSIONS,
  formatDuration,
  formatDistance,
  formatDate,
  formatGeneratedDate,
} from './reportConfig';
import { type PdfContext, drawPdfHeader, drawPdfFooter } from './pdfHelpers';
import {
  drawSummarySection,
  drawZonesSection,
  drawPolarizationSection,
  drawTrainingLoadSection,
  drawTopActivitiesSection,
  drawRecordsSection,
  drawTypeDistributionSection,
} from './report-export/pdfSections';
import { generateHtmlReport } from './report-export/htmlGenerator';

// Re-export des formatters pour compatibilité
export { formatDuration, formatDistance, formatDate };

/**
 * Export du rapport au format PDF
 */
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

  // Message si aucune activité
  if (report.summary.totalActivities === 0) {
    pdf.setTextColor(REPORT_COLORS.textSecondary);
    pdf.setFontSize(14);
    pdf.text('Aucune activité enregistrée pour cette période.', pageWidth / 2, ctx.y + 20, { align: 'center' });
    pdf.save(filename);
    return;
  }

  // Sections du rapport
  drawSummarySection(ctx, report, contentWidth, margin);
  drawZonesSection(ctx, report, contentWidth, margin);
  drawPolarizationSection(ctx, report, contentWidth, margin);
  drawTrainingLoadSection(ctx, report, contentWidth, margin);
  drawTopActivitiesSection(ctx, report, contentWidth, margin);
  drawRecordsSection(ctx, report, margin, pageWidth);
  drawTypeDistributionSection(ctx, report, margin, pageWidth);

  // Footer
  drawPdfFooter(pdf, formatGeneratedDate());

  pdf.save(filename);
}

/**
 * Export du rapport au format HTML
 */
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
