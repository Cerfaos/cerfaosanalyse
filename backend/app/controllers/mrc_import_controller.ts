import type { HttpContext } from '@adonisjs/core/http'
import TrainingTemplate from '#models/training_template'
import TrainingSession from '#models/training_session'
import MrcParserService from '#services/mrc_parser_service'

export default class MrcImportController {
  private parser = new MrcParserService()

  /**
   * Prévisualiser un fichier MRC sans l'importer
   */
  async preview({ request, response }: HttpContext) {
    const file = request.file('file', {
      extnames: ['mrc'],
      size: '2mb',
    })

    if (!file) {
      return response.badRequest({
        message: 'Aucun fichier MRC fourni',
      })
    }

    if (!file.isValid) {
      return response.badRequest({
        message: 'Fichier invalide',
        errors: file.errors,
      })
    }

    try {
      const content = await this.readFileContent(file.tmpPath!)
      const parsed = this.parser.parse(content)

      // Calculer le TSS si c'est une séance cyclisme
      let tss: number | null = null
      if (parsed.category === 'cycling' && parsed.blocks) {
        tss = this.parser.calculateTss(parsed.blocks, parsed.totalDuration)
      }

      return response.ok({
        message: 'Prévisualisation du fichier MRC',
        data: {
          name: parsed.name,
          description: parsed.header.description,
          category: parsed.category,
          level: parsed.level,
          duration: Math.round(parsed.totalDuration),
          tss,
          averageIntensity: parsed.averageIntensity,
          intensityRef: parsed.blocks ? this.parser.generateIntensityRef(parsed.blocks) : null,
          blocks: parsed.blocks || null,
          exercises: parsed.exercises || null,
          rawHeader: parsed.header,
          dataPointsCount: parsed.dataPoints.length,
        },
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erreur lors du parsing du fichier MRC',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  /**
   * Importer un fichier MRC comme template
   */
  async importAsTemplate({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const file = request.file('file', {
      extnames: ['mrc'],
      size: '2mb',
    })

    if (!file) {
      return response.badRequest({
        message: 'Aucun fichier MRC fourni',
      })
    }

    if (!file.isValid) {
      return response.badRequest({
        message: 'Fichier invalide',
        errors: file.errors,
      })
    }

    // Options d'importation
    const customName = request.input('name')
    const customLevel = request.input('level')
    const week = request.input('week')
    const day = request.input('day')

    try {
      const content = await this.readFileContent(file.tmpPath!)
      const parsed = this.parser.parse(content)

      // Calculer le TSS si c'est une séance cyclisme
      let tss: number | null = null
      let intensityRef = '60-70% FTP'
      if (parsed.category === 'cycling' && parsed.blocks) {
        tss = this.parser.calculateTss(parsed.blocks, parsed.totalDuration)
        intensityRef = this.parser.generateIntensityRef(parsed.blocks)
      }

      const template = await TrainingTemplate.create({
        userId: user.id,
        name: customName || parsed.name,
        category: parsed.category,
        level: customLevel || parsed.level,
        location: 'indoor', // Fichiers MRC = home trainer = indoor
        intensityRef,
        week: week ? parseInt(week) : null,
        day: day ? parseInt(day) : null,
        duration: Math.round(parsed.totalDuration),
        tss,
        description: parsed.header.description || null,
        blocks: parsed.blocks || null,
        exercises: parsed.exercises || null,
        isDefault: false,
        isPublic: false,
      })

      return response.created({
        message: 'Template importé avec succès',
        data: template,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erreur lors de l\'importation du fichier MRC',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  /**
   * Importer un fichier MRC comme séance
   */
  async importAsSession({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const file = request.file('file', {
      extnames: ['mrc'],
      size: '2mb',
    })

    if (!file) {
      return response.badRequest({
        message: 'Aucun fichier MRC fourni',
      })
    }

    if (!file.isValid) {
      return response.badRequest({
        message: 'Fichier invalide',
        errors: file.errors,
      })
    }

    // Options d'importation
    const customName = request.input('name')
    const customLevel = request.input('level')

    try {
      const content = await this.readFileContent(file.tmpPath!)
      const parsed = this.parser.parse(content)

      // Calculer le TSS si c'est une séance cyclisme
      let tss: number | null = null
      let intensityRef = '60-70% FTP'
      if (parsed.category === 'cycling' && parsed.blocks) {
        tss = this.parser.calculateTss(parsed.blocks, parsed.totalDuration)
        intensityRef = this.parser.generateIntensityRef(parsed.blocks)
      }

      const session = await TrainingSession.create({
        userId: user.id,
        templateId: null,
        name: customName || parsed.name,
        category: parsed.category,
        level: customLevel || parsed.level,
        location: 'indoor',
        intensityRef,
        duration: Math.round(parsed.totalDuration),
        tss,
        description: parsed.header.description || null,
        blocks: parsed.blocks || null,
        exercises: parsed.exercises || null,
      })

      return response.created({
        message: 'Séance importée avec succès',
        data: session,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Erreur lors de l\'importation du fichier MRC',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  /**
   * Importer plusieurs fichiers MRC en batch
   */
  async importBatch({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const files = request.files('files', {
      extnames: ['mrc'],
      size: '2mb',
    })

    if (!files || files.length === 0) {
      return response.badRequest({
        message: 'Aucun fichier MRC fourni',
      })
    }

    const importAs = request.input('importAs', 'template') // 'template' ou 'session'
    const results: { success: any[]; errors: any[] } = { success: [], errors: [] }

    for (const file of files) {
      if (!file.isValid) {
        results.errors.push({
          fileName: file.clientName,
          error: file.errors[0]?.message || 'Fichier invalide',
        })
        continue
      }

      try {
        const content = await this.readFileContent(file.tmpPath!)
        const parsed = this.parser.parse(content)

        // Calculer le TSS si c'est une séance cyclisme
        let tss: number | null = null
        let intensityRef = '60-70% FTP'
        if (parsed.category === 'cycling' && parsed.blocks) {
          tss = this.parser.calculateTss(parsed.blocks, parsed.totalDuration)
          intensityRef = this.parser.generateIntensityRef(parsed.blocks)
        }

        if (importAs === 'template') {
          const template = await TrainingTemplate.create({
            userId: user.id,
            name: parsed.name,
            category: parsed.category,
            level: parsed.level,
            location: 'indoor',
            intensityRef,
            week: null,
            duration: Math.round(parsed.totalDuration),
            tss,
            description: parsed.header.description || null,
            blocks: parsed.blocks || null,
            exercises: parsed.exercises || null,
            isDefault: false,
            isPublic: false,
          })
          results.success.push({
            fileName: file.clientName,
            id: template.id,
            name: template.name,
            type: 'template',
          })
        } else {
          const session = await TrainingSession.create({
            userId: user.id,
            templateId: null,
            name: parsed.name,
            category: parsed.category,
            level: parsed.level,
            location: 'indoor',
            intensityRef,
            duration: Math.round(parsed.totalDuration),
            tss,
            description: parsed.header.description || null,
            blocks: parsed.blocks || null,
            exercises: parsed.exercises || null,
          })
          results.success.push({
            fileName: file.clientName,
            id: session.id,
            name: session.name,
            type: 'session',
          })
        }
      } catch (error) {
        results.errors.push({
          fileName: file.clientName,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        })
      }
    }

    return response.ok({
      message: `Import terminé: ${results.success.length} succès, ${results.errors.length} erreurs`,
      data: results,
    })
  }

  /**
   * Lire le contenu d'un fichier
   */
  private async readFileContent(filePath: string): Promise<string> {
    const fs = await import('node:fs/promises')
    return fs.readFile(filePath, 'utf-8')
  }
}
