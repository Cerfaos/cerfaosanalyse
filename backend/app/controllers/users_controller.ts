import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs/promises'
import path from 'node:path'

export default class UsersController {
  /**
   * Mettre à jour le profil de l'utilisateur connecté
   */
  async updateProfile({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    // Données acceptées pour la mise à jour
    const data = request.only(['fullName', 'fcMax', 'fcRepos', 'weightCurrent', 'theme'])

    // Validation basique
    if (data.fcMax !== undefined && (data.fcMax < 100 || data.fcMax > 220)) {
      return response.badRequest({ message: 'FC max doit être entre 100 et 220 bpm' })
    }

    if (data.fcRepos !== undefined && (data.fcRepos < 30 || data.fcRepos > 100)) {
      return response.badRequest({ message: 'FC repos doit être entre 30 et 100 bpm' })
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
