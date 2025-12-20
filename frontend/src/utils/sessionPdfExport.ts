import { jsPDF } from 'jspdf'
import type {
  TrainingSession,
  CyclingBlock,
  PpgExercise,
} from '../types/training'
import {
  BLOCK_TYPE_LABELS,
  LEVEL_LABELS,
  CATEGORY_LABELS,
  percentFtpToWatts,
} from '../types/training'

interface ExportOptions {
  session: TrainingSession
  ftp: number
  weight: number
  userName?: string
}

/**
 * Exporte une séance d'entraînement en PDF
 */
export async function exportSessionToPdf(options: ExportOptions): Promise<void> {
  const { session, ftp, weight, userName } = options

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Couleurs
  const primaryColor = [139, 195, 74] as [number, number, number] // #8BC34A
  const textColor = [33, 33, 33] as [number, number, number]
  const mutedColor = [117, 117, 117] as [number, number, number]

  // === EN-TÊTE ===
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(session.name, margin, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${CATEGORY_LABELS[session.category]} • ${LEVEL_LABELS[session.level]} • ${session.duration} min`,
    margin,
    23
  )

  if (userName) {
    doc.text(`Athlète: ${userName}`, margin, 30)
  }

  y = 45

  // === INFOS PRINCIPALES ===
  doc.setTextColor(...textColor)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Informations', margin, y)

  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const infos = [
    ['Durée totale', `${session.duration} minutes`],
    ['TSS estimé', `${session.tss || 'N/A'} points`],
    ['FTP de référence', `${ftp} watts`],
    ['Poids', `${weight} kg`],
    ['Ratio W/kg', `${(ftp / weight).toFixed(2)} W/kg`],
  ]

  infos.forEach(([label, value]) => {
    doc.setTextColor(...mutedColor)
    doc.text(label + ':', margin, y)
    doc.setTextColor(...textColor)
    doc.text(value, margin + 40, y)
    y += 5
  })

  y += 5

  // === DESCRIPTION ===
  if (session.description) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Description', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...mutedColor)
    const descLines = doc.splitTextToSize(session.description, contentWidth)
    doc.text(descLines, margin, y)
    y += descLines.length * 4 + 5
  }

  // === BLOCS D'ENTRAÎNEMENT (Cycling) ===
  if (session.category === 'cycling' && session.blocks && session.blocks.length > 0) {
    y += 5
    doc.setTextColor(...textColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text("Blocs d'entraînement", margin, y)
    y += 8

    // En-têtes du tableau
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, y - 4, contentWidth, 8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...textColor)

    const colWidths = [25, 20, 20, 25, 15, contentWidth - 105]
    const headers = ['Type', 'Durée', '% FTP', 'Puissance', 'Rép.', 'Notes']
    let x = margin

    headers.forEach((header, i) => {
      doc.text(header, x + 2, y)
      x += colWidths[i]
    })

    y += 6

    // Données
    doc.setFont('helvetica', 'normal')
    session.blocks.forEach((block: CyclingBlock) => {
      if (y > 270) {
        doc.addPage()
        y = margin
      }

      const watts = percentFtpToWatts(block.percentFtp, ftp)

      x = margin
      const row = [
        BLOCK_TYPE_LABELS[block.type],
        block.duration,
        `${block.percentFtp}%`,
        `${watts}W`,
        `${block.reps}×`,
        block.notes || '-',
      ]

      // Couleur de fond alternée
      if (session.blocks!.indexOf(block) % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, y - 3, contentWidth, 6, 'F')
      }

      // Indicateur de zone coloré
      const zoneColor = getZoneColor(block.percentFtp)
      doc.setFillColor(...zoneColor)
      doc.rect(margin - 3, y - 3, 2, 6, 'F')

      row.forEach((cell, i) => {
        const text = cell.length > 25 ? cell.substring(0, 22) + '...' : cell
        doc.text(text, x + 2, y)
        x += colWidths[i]
      })

      y += 6
    })

    y += 5
  }

  // === EXERCICES PPG ===
  if (session.category === 'ppg' && session.exercises && session.exercises.length > 0) {
    y += 5
    doc.setTextColor(...textColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Exercices', margin, y)
    y += 8

    session.exercises.forEach((exercise: PpgExercise, idx: number) => {
      if (y > 265) {
        doc.addPage()
        y = margin
      }

      // Numéro et nom
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${idx + 1}. ${exercise.name}`, margin, y)

      // Détails
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...mutedColor)

      let details = ''
      if (exercise.reps) {
        details = `${exercise.sets}×${exercise.reps} reps`
      } else {
        details = `${exercise.sets}×${exercise.duration}`
      }
      details += ` • Repos: ${exercise.rest}`

      doc.text(details, margin + 5, y + 5)

      // Notes
      if (exercise.notes) {
        doc.setFontSize(8)
        doc.text(exercise.notes, margin + 5, y + 10)
        y += 15
      } else {
        y += 10
      }

      doc.setTextColor(...textColor)
    })
  }

  // === ZONES DE PUISSANCE (référence) ===
  if (session.category === 'cycling') {
    y += 10
    if (y > 250) {
      doc.addPage()
      y = margin
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('Zones de puissance (référence)', margin, y)
    y += 7

    const zones = [
      { name: 'Z1 - Récupération', range: '< 55%', watts: `< ${Math.round(ftp * 0.55)}W` },
      { name: 'Z2 - Endurance', range: '55-75%', watts: `${Math.round(ftp * 0.55)}-${Math.round(ftp * 0.75)}W` },
      { name: 'Z3 - Tempo', range: '75-90%', watts: `${Math.round(ftp * 0.75)}-${Math.round(ftp * 0.90)}W` },
      { name: 'Z4 - Seuil', range: '90-105%', watts: `${Math.round(ftp * 0.90)}-${Math.round(ftp * 1.05)}W` },
      { name: 'Z5 - VO2max', range: '105-120%', watts: `${Math.round(ftp * 1.05)}-${Math.round(ftp * 1.20)}W` },
      { name: 'Z6 - Anaérobie', range: '> 120%', watts: `> ${Math.round(ftp * 1.20)}W` },
    ]

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    zones.forEach((zone, idx) => {
      const zoneColors: [number, number, number][] = [
        [148, 163, 184],
        [34, 197, 94],
        [234, 179, 8],
        [249, 115, 22],
        [239, 68, 68],
        [220, 38, 38],
      ]

      doc.setFillColor(...zoneColors[idx])
      doc.rect(margin, y - 2, 3, 4, 'F')

      doc.setTextColor(...textColor)
      doc.text(zone.name, margin + 5, y)
      doc.setTextColor(...mutedColor)
      doc.text(zone.range, margin + 45, y)
      doc.text(zone.watts, margin + 70, y)

      y += 5
    })
  }

  // === PIED DE PAGE ===
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...mutedColor)
    doc.text(
      `Centre d'Analyse Cycliste • Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      new Date().toLocaleDateString('fr-FR'),
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
  }

  // Télécharger le PDF
  const filename = `seance-${session.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Obtenir la couleur RGB d'une zone de puissance
 */
function getZoneColor(percentFtp: number): [number, number, number] {
  if (percentFtp <= 55) return [148, 163, 184] // gray
  if (percentFtp <= 75) return [34, 197, 94] // green
  if (percentFtp <= 90) return [234, 179, 8] // yellow
  if (percentFtp <= 105) return [249, 115, 22] // orange
  if (percentFtp <= 120) return [239, 68, 68] // red
  return [220, 38, 38] // dark red
}

export default exportSessionToPdf
