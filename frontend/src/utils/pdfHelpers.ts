/**
 * Helpers pour la génération de PDF avec jsPDF
 */

import type { jsPDF } from 'jspdf';
import { PDF_DIMENSIONS, REPORT_COLORS } from './reportConfig';

export interface PdfContext {
  pdf: jsPDF;
  y: number;
}

/**
 * Vérifie si une nouvelle page est nécessaire et l'ajoute si besoin
 */
export function checkNewPage(ctx: PdfContext, neededHeight: number): boolean {
  if (ctx.y + neededHeight > PDF_DIMENSIONS.pageHeight - PDF_DIMENSIONS.margin) {
    ctx.pdf.addPage();
    ctx.y = PDF_DIMENSIONS.margin;
    return true;
  }
  return false;
}

/**
 * Dessine un rectangle coloré
 */
export function drawRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  pdf.setFillColor(color);
  pdf.rect(x, y, w, h, 'F');
}

/**
 * Dessine un titre de section
 */
export function drawSectionTitle(ctx: PdfContext, title: string): void {
  ctx.pdf.setTextColor(REPORT_COLORS.primary);
  ctx.pdf.setFontSize(14);
  ctx.pdf.setFont('helvetica', 'bold');
  ctx.pdf.text(title, PDF_DIMENSIONS.margin, ctx.y);
  ctx.y += 8;
}

/**
 * Dessine une carte de métrique
 */
export function drawMetricCard(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  value: string,
  label: string,
  valueColor: string = REPORT_COLORS.primary
): void {
  drawRect(pdf, x, y, width, height, REPORT_COLORS.bgCard);

  pdf.setTextColor(valueColor);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(value, x + width / 2, y + height / 2 - 1, { align: 'center' });

  pdf.setTextColor(REPORT_COLORS.textSecondary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(label, x + width / 2, y + height / 2 + 5, { align: 'center' });
}

/**
 * Dessine une barre de progression
 */
export function drawProgressBar(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  value: number,
  color: string,
  targetValue?: number
): void {
  // Fond
  drawRect(pdf, x, y, width, height, REPORT_COLORS.bgCard);

  // Barre de progression
  const fillWidth = Math.min(value, 100) * width / 100;
  drawRect(pdf, x, y, fillWidth, height, color);

  // Ligne cible optionnelle
  if (targetValue !== undefined) {
    const targetX = x + (targetValue * width / 100);
    pdf.setDrawColor(REPORT_COLORS.textPrimary);
    pdf.setLineWidth(0.3);
    pdf.line(targetX, y, targetX, y + height);
  }
}

/**
 * Dessine l'en-tête du PDF
 */
export function drawPdfHeader(
  ctx: PdfContext,
  title: string,
  subtitle: string
): void {
  const { pdf } = ctx;
  const { pageWidth, margin } = PDF_DIMENSIONS;

  drawRect(pdf, 0, 0, pageWidth, 45, REPORT_COLORS.bgDark);

  pdf.setTextColor(REPORT_COLORS.primary);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });

  pdf.setTextColor(REPORT_COLORS.textSecondary);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitle, pageWidth / 2, 30, { align: 'center' });

  pdf.setDrawColor(REPORT_COLORS.primary);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 40, pageWidth - margin, 40);

  ctx.y = 55;
}

/**
 * Dessine le footer du PDF
 */
export function drawPdfFooter(pdf: jsPDF, generatedAt: string): void {
  const { pageWidth, pageHeight, margin } = PDF_DIMENSIONS;
  const footerY = pageHeight - 15;

  pdf.setDrawColor(REPORT_COLORS.border);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  pdf.setTextColor(REPORT_COLORS.primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text("Centre d'Analyse Cycliste", pageWidth / 2, footerY, { align: 'center' });

  pdf.setTextColor(REPORT_COLORS.textSecondary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Généré le ${generatedAt}`, pageWidth / 2, footerY + 5, { align: 'center' });
}
