import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface ExportOptions {
  fileName?: string
  format?: 'png' | 'pdf'
  quality?: number
}

export function useActivityExport() {
  const exportToImage = async (elementId: string, options: ExportOptions = {}) => {
    const { fileName = 'activity', quality = 1 } = options

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Préparer l'élément pour la capture
    const originalBg = element.style.backgroundColor
    element.style.backgroundColor = '#ffffff'

    try {
      const canvas = await html2canvas(element, {
        scale: quality * 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      // Télécharger l'image
      const link = document.createElement('a')
      link.download = `${fileName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      return true
    } finally {
      element.style.backgroundColor = originalBg
    }
  }

  const exportToPDF = async (elementId: string, options: ExportOptions = {}) => {
    const { fileName = 'activity', quality = 1 } = options

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    const originalBg = element.style.backgroundColor
    element.style.backgroundColor = '#ffffff'

    try {
      const canvas = await html2canvas(element, {
        scale: quality * 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Calculer les dimensions pour le PDF (A4)
      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const width = imgWidth * ratio
      const height = imgHeight * ratio

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Centrer l'image sur la page
      const x = (pdf.internal.pageSize.getWidth() - width) / 2
      const y = (pdf.internal.pageSize.getHeight() - height) / 2

      pdf.addImage(imgData, 'PNG', x, y, width, height)
      pdf.save(`${fileName}.pdf`)

      return true
    } finally {
      element.style.backgroundColor = originalBg
    }
  }

  const exportActivity = async (elementId: string, options: ExportOptions = {}) => {
    const { format = 'png' } = options

    if (format === 'pdf') {
      return exportToPDF(elementId, options)
    } else {
      return exportToImage(elementId, options)
    }
  }

  return { exportActivity, exportToImage, exportToPDF }
}
