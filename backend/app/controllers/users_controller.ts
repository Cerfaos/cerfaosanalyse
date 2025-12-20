import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs/promises'
import type { FtpHistoryEntry } from '../models/user.js'

export default class UsersController {
  /**
   * Mettre à jour le profil de l'utilisateur connecté
   */
  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Données acceptées pour la mise à jour
    const data = request.only(['fullName', 'fcMax', 'fcRepos', 'ftp', 'weightCurrent', 'theme'])

    // Validation basique
    if (data.fcMax !== undefined && (data.fcMax < 100 || data.fcMax > 220)) {
      return response.badRequest({ message: 'FC max doit être entre 100 et 220 bpm' })
    }

    if (data.fcRepos !== undefined && (data.fcRepos < 30 || data.fcRepos > 100)) {
      return response.badRequest({ message: 'FC repos doit être entre 30 et 100 bpm' })
    }

    if (data.ftp !== undefined && data.ftp !== null && (data.ftp < 50 || data.ftp > 600)) {
      return response.badRequest({ message: 'FTP doit être entre 50 et 600 watts' })
    }

    if (data.weightCurrent !== undefined && (data.weightCurrent < 30 || data.weightCurrent > 300)) {
      return response.badRequest({
        message: 'Le poids doit être entre 30 et 300 kg',
      })
    }

    if (data.theme && !['light', 'dark'].includes(data.theme)) {
      return response.badRequest({ message: 'Le thème doit être "light" ou "dark"' })
    }

    // Mise à jour de l'utilisateur
    user.merge(data)
    await user.save()

    return response.ok({
      message: 'Profil mis à jour avec succès',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        fcMax: user.fcMax,
        fcRepos: user.fcRepos,
        ftp: user.ftp,
        weightCurrent: user.weightCurrent,
        theme: user.theme,
        avatarUrl: user.avatarUrl,
      },
    })
  }

  /**
   * Calculer les zones de fréquence cardiaque (méthode Karvonen)
   */
  async getHeartRateZones({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.fcMax || !user.fcRepos) {
      return response.badRequest({
        message: 'FC max et FC repos sont requis pour calculer les zones',
      })
    }

    const fcReserve = user.fcMax - user.fcRepos

    const zones = [
      {
        zone: 1,
        name: 'Récupération',
        min: Math.round(user.fcRepos + 0.5 * fcReserve),
        max: Math.round(user.fcRepos + 0.6 * fcReserve),
        description: 'Récupération active, échauffement',
      },
      {
        zone: 2,
        name: 'Endurance',
        min: Math.round(user.fcRepos + 0.6 * fcReserve),
        max: Math.round(user.fcRepos + 0.7 * fcReserve),
        description: 'Endurance fondamentale, sorties longues',
      },
      {
        zone: 3,
        name: 'Tempo',
        min: Math.round(user.fcRepos + 0.7 * fcReserve),
        max: Math.round(user.fcRepos + 0.8 * fcReserve),
        description: 'Tempo, rythme soutenu',
      },
      {
        zone: 4,
        name: 'Seuil',
        min: Math.round(user.fcRepos + 0.8 * fcReserve),
        max: Math.round(user.fcRepos + 0.9 * fcReserve),
        description: 'Seuil anaérobie, efforts intenses',
      },
      {
        zone: 5,
        name: 'VO2 max',
        min: Math.round(user.fcRepos + 0.9 * fcReserve),
        max: user.fcMax,
        description: 'Efforts maximaux, sprints',
      },
    ]

    return response.ok({
      data: {
        fcMax: user.fcMax,
        fcRepos: user.fcRepos,
        fcReserve: fcReserve,
        zones: zones,
      },
    })
  }

  /**
   * Calculer les zones de puissance basées sur le FTP
   */
  async getPowerZones({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (!user.ftp) {
      return response.badRequest({
        message: 'FTP est requis pour calculer les zones de puissance',
      })
    }

    const zones = [
      {
        zone: 1,
        name: 'Récupération active',
        min: 0,
        max: Math.round(user.ftp * 0.55),
        percentage: '<55%',
        description: 'Récupération, échauffement léger',
        color: '#94A3B8', // slate
      },
      {
        zone: 2,
        name: 'Endurance',
        min: Math.round(user.ftp * 0.55),
        max: Math.round(user.ftp * 0.75),
        percentage: '55-75%',
        description: 'Sorties longues, base aérobie',
        color: '#22C55E', // green
      },
      {
        zone: 3,
        name: 'Tempo',
        min: Math.round(user.ftp * 0.75),
        max: Math.round(user.ftp * 0.90),
        percentage: '75-90%',
        description: 'Rythme soutenu, tempo',
        color: '#FACC15', // yellow
      },
      {
        zone: 4,
        name: 'Seuil lactique',
        min: Math.round(user.ftp * 0.90),
        max: Math.round(user.ftp * 1.05),
        percentage: '90-105%',
        description: 'Travail au seuil, intervalles longs',
        color: '#F97316', // orange
      },
      {
        zone: 5,
        name: 'VO2 max',
        min: Math.round(user.ftp * 1.05),
        max: Math.round(user.ftp * 1.20),
        percentage: '105-120%',
        description: 'Intervalles courts, efforts intenses',
        color: '#EF4444', // red
      },
      {
        zone: 6,
        name: 'Capacité anaérobie',
        min: Math.round(user.ftp * 1.20),
        max: Math.round(user.ftp * 1.50),
        percentage: '120-150%',
        description: 'Sprints courts, efforts maximaux',
        color: '#A855F7', // purple
      },
      {
        zone: 7,
        name: 'Puissance neuromusculaire',
        min: Math.round(user.ftp * 1.50),
        max: null,
        percentage: '>150%',
        description: 'Sprints explosifs, < 30s',
        color: '#EC4899', // pink
      },
    ]

    // Calcul du ratio W/kg si le poids est disponible
    const wPerKg = user.weightCurrent ? Math.round((user.ftp / user.weightCurrent) * 100) / 100 : null

    return response.ok({
      data: {
        ftp: user.ftp,
        weight: user.weightCurrent,
        wPerKg: wPerKg,
        zones: zones,
      },
    })
  }

  /**
   * Récupérer le profil d'entraînement (FTP, poids, FC, historique)
   */
  async getTrainingProfile({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    return response.ok({
      data: {
        ftp: user.ftp,
        weight: user.weightCurrent,
        fcMax: user.fcMax,
        fcRepos: user.fcRepos,
        ftpHistory: user.ftpHistory || [],
      },
    })
  }

  /**
   * Mettre à jour le profil d'entraînement avec gestion de l'historique FTP
   */
  async updateTrainingProfile({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const data = request.only(['ftp', 'weight', 'fcMax', 'fcRepos'])

    // Validation
    if (data.ftp !== undefined && data.ftp !== null && (data.ftp < 50 || data.ftp > 600)) {
      return response.badRequest({ message: 'FTP doit être entre 50 et 600 watts' })
    }

    if (data.weight !== undefined && data.weight !== null && (data.weight < 30 || data.weight > 300)) {
      return response.badRequest({ message: 'Le poids doit être entre 30 et 300 kg' })
    }

    if (data.fcMax !== undefined && data.fcMax !== null && (data.fcMax < 100 || data.fcMax > 220)) {
      return response.badRequest({ message: 'FC max doit être entre 100 et 220 bpm' })
    }

    if (data.fcRepos !== undefined && data.fcRepos !== null && (data.fcRepos < 30 || data.fcRepos > 100)) {
      return response.badRequest({ message: 'FC repos doit être entre 30 et 100 bpm' })
    }

    // Gestion de l'historique FTP si la FTP change
    if (data.ftp !== undefined && data.ftp !== null && data.ftp !== user.ftp) {
      // Ajouter l'ancienne FTP à l'historique si elle existe
      if (user.ftp) {
        const history: FtpHistoryEntry[] = user.ftpHistory || []
        history.push({
          ftp: user.ftp,
          date: new Date().toISOString(),
        })
        // Garder les 24 dernières entrées (2 ans d'historique mensuel)
        user.ftpHistory = history.slice(-24)
      }
      user.ftp = data.ftp
    }

    // Mise à jour des autres champs
    if (data.weight !== undefined) {
      user.weightCurrent = data.weight
    }
    if (data.fcMax !== undefined) {
      user.fcMax = data.fcMax
    }
    if (data.fcRepos !== undefined) {
      user.fcRepos = data.fcRepos
    }

    await user.save()

    return response.ok({
      message: 'Profil d\'entraînement mis à jour',
      data: {
        ftp: user.ftp,
        weight: user.weightCurrent,
        fcMax: user.fcMax,
        fcRepos: user.fcRepos,
        ftpHistory: user.ftpHistory || [],
      },
    })
  }

  async uploadAvatar({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const avatar = request.file('avatar', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'] as const,
    })

    if (!avatar) {
      return response.badRequest({ message: 'Aucun fichier détecté' })
    }

    if (!avatar.isValid) {
      return response.badRequest({ message: avatar.errors?.[0]?.message || 'Fichier invalide' })
    }

    const uploadsDir = app.makePath('public/uploads/avatars')
    await fs.mkdir(uploadsDir, { recursive: true })

    const fileName = `${cuid()}.${avatar.extname}`
    await avatar.move(uploadsDir, {
      name: fileName,
      overwrite: true,
    })

    const relativePath = `/uploads/avatars/${fileName}`

    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const relative = user.avatarUrl.replace(/^\//, '')
      try {
        await fs.unlink(app.makePath('public', relative))
      } catch (error) {
        console.warn('Impossible de supprimer l\'ancien avatar:', error)
      }
    }

    user.avatarUrl = relativePath
    await user.save()

    return response.ok({
      message: 'Avatar mis à jour',
      data: {
        avatarUrl: relativePath,
      },
    })
  }
}
