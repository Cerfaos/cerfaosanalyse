import type { HttpContext } from '@adonisjs/core/http'
import BadgeService from '#services/badge_service'

export default class BadgesController {
  /**
   * Récupérer tous les badges avec leur statut pour l'utilisateur connecté
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    const badgeService = new BadgeService()

    const badgesWithProgress = await badgeService.getUserBadgesWithProgress(user.id)

    // Séparer les badges débloqués et verrouillés
    const unlocked = badgesWithProgress.filter((b) => b.unlocked)
    const locked = badgesWithProgress.filter((b) => !b.unlocked)

    // Statistiques
    const totalBadges = badgesWithProgress.length
    const unlockedCount = unlocked.length
    const percentageUnlocked = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0

    return response.ok({
      message: 'Badges récupérés',
      data: {
        unlocked,
        locked,
        stats: {
          total: totalBadges,
          unlocked: unlockedCount,
          locked: locked.length,
          percentageUnlocked,
        },
      },
    })
  }

  /**
   * Vérifier et attribuer de nouveaux badges manuellement (pour test)
   */
  async check({ auth, response }: HttpContext) {
    const user = auth.user!
    const badgeService = new BadgeService()

    const newBadges = await badgeService.checkAndAwardBadges(user.id)

    return response.ok({
      message: `${newBadges.length} nouveaux badges débloqués`,
      data: newBadges,
    })
  }
}
