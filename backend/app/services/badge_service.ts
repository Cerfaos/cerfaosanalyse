import { DateTime } from 'luxon'
import User from '#models/user'
import Badge from '#models/badge'
import UserBadge from '#models/user_badge'
import Activity from '#models/activity'

export default class BadgeService {
  /**
   * Vérifier et attribuer les nouveaux badges pour un utilisateur
   * Retourne les badges nouvellement débloqués
   */
  async checkAndAwardBadges(userId: number): Promise<Badge[]> {
    const user = await User.findOrFail(userId)
    const newlyUnlockedBadges: Badge[] = []

    // Récupérer tous les badges
    const allBadges = await Badge.query().orderBy('sort_order', 'asc')

    // Récupérer les badges déjà débloqués
    const unlockedBadgeIds = await UserBadge.query()
      .where('user_id', userId)
      .select('badge_id')
      .then((rows) => rows.map((r) => r.badgeId))

    // Pour chaque badge non débloqué, vérifier la condition
    for (const badge of allBadges) {
      if (unlockedBadgeIds.includes(badge.id)) {
        continue // Déjà débloqué
      }

      const isUnlocked = await this.checkBadgeCondition(user, badge)

      if (isUnlocked.unlocked) {
        // Débloquer le badge
        await UserBadge.create({
          userId: user.id,
          badgeId: badge.id,
          unlockedAt: DateTime.now(),
          valueAtUnlock: isUnlocked.currentValue,
        })

        newlyUnlockedBadges.push(badge)
      }
    }

    return newlyUnlockedBadges
  }

  /**
   * Vérifier si un badge spécifique est débloqué
   */
  private async checkBadgeCondition(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number | null }> {
    switch (badge.conditionType) {
      case 'total_distance':
        return await this.checkTotalDistance(user, badge)

      case 'total_activities':
        return await this.checkTotalActivities(user, badge)

      case 'total_elevation':
        return await this.checkTotalElevation(user, badge)

      case 'consecutive_days':
        return await this.checkConsecutiveDays(user, badge)

      case 'total_time':
        return await this.checkTotalTime(user, badge)

      case 'special':
        return await this.checkSpecial(user, badge)

      default:
        return { unlocked: false, currentValue: null }
    }
  }

  /**
   * Vérifier la distance totale
   */
  private async checkTotalDistance(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number }> {
    const totalDistance = await Activity.query()
      .where('user_id', user.id)
      .sum('distance as total')
      .first()

    const currentValue = Number(totalDistance?.$extras.total || 0)
    const unlocked = badge.conditionValue ? currentValue >= badge.conditionValue : false

    return { unlocked, currentValue }
  }

  /**
   * Vérifier le nombre total d'activités
   */
  private async checkTotalActivities(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number }> {
    const count = await Activity.query().where('user_id', user.id).count('* as total').first()

    const currentValue = Number(count?.$extras.total || 0)
    const unlocked = badge.conditionValue ? currentValue >= badge.conditionValue : false

    return { unlocked, currentValue }
  }

  /**
   * Vérifier le dénivelé total
   */
  private async checkTotalElevation(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number }> {
    const totalElevation = await Activity.query()
      .where('user_id', user.id)
      .sum('elevation_gain as total')
      .first()

    const currentValue = Number(totalElevation?.$extras.total || 0)
    const unlocked = badge.conditionValue ? currentValue >= badge.conditionValue : false

    return { unlocked, currentValue }
  }

  /**
   * Vérifier les jours consécutifs
   */
  private async checkConsecutiveDays(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number }> {
    const activities = await Activity.query()
      .where('user_id', user.id)
      .orderBy('date', 'desc')
      .select('date')

    if (activities.length === 0) {
      return { unlocked: false, currentValue: 0 }
    }

    // Compter les jours consécutifs en partant d'aujourd'hui
    let consecutiveDays = 0
    let currentDate = DateTime.now().startOf('day')

    // Créer un Set des dates d'activité (format YYYY-MM-DD)
    const activityDates = new Set(
      activities.map((a) => a.date.toFormat('yyyy-MM-dd'))
    )

    // Vérifier jour par jour
    while (activityDates.has(currentDate.toFormat('yyyy-MM-dd'))) {
      consecutiveDays++
      currentDate = currentDate.minus({ days: 1 })
    }

    // Si aucune activité aujourd'hui mais hier oui, commencer d'hier
    if (consecutiveDays === 0 && activityDates.has(currentDate.toFormat('yyyy-MM-dd'))) {
      currentDate = DateTime.now().minus({ days: 1 }).startOf('day')
      while (activityDates.has(currentDate.toFormat('yyyy-MM-dd'))) {
        consecutiveDays++
        currentDate = currentDate.minus({ days: 1 })
      }
    }

    const unlocked = badge.conditionValue ? consecutiveDays >= badge.conditionValue : false

    return { unlocked, currentValue: consecutiveDays }
  }

  /**
   * Vérifier le temps total
   */
  private async checkTotalTime(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number }> {
    const totalTime = await Activity.query()
      .where('user_id', user.id)
      .sum('duration as total')
      .first()

    const currentValue = Number(totalTime?.$extras.total || 0)
    const unlocked = badge.conditionValue ? currentValue >= badge.conditionValue : false

    return { unlocked, currentValue }
  }

  /**
   * Vérifier les badges spéciaux
   */
  private async checkSpecial(
    user: User,
    badge: Badge
  ): Promise<{ unlocked: boolean; currentValue: number | null }> {
    switch (badge.code) {
      case 'special_first_activity': {
        const count = await Activity.query().where('user_id', user.id).count('* as total').first()
        const activityCount = Number(count?.$extras.total || 0)
        return { unlocked: activityCount >= 1, currentValue: activityCount }
      }

      default:
        return { unlocked: false, currentValue: null }
    }
  }

  /**
   * Récupérer tous les badges avec leur statut pour un utilisateur
   */
  async getUserBadgesWithProgress(userId: number): Promise<
    Array<{
      badge: Badge
      unlocked: boolean
      unlockedAt: DateTime | null
      progress: number // Pourcentage de progression (0-100)
      currentValue: number | null
      targetValue: number | null
    }>
  > {
    const user = await User.findOrFail(userId)
    const allBadges = await Badge.query().orderBy('category', 'asc').orderBy('level', 'asc')

    // Récupérer les badges déjà débloqués
    const userBadges = await UserBadge.query().where('user_id', userId)
    const unlockedMap = new Map(
      userBadges.map((ub) => [ub.badgeId, { unlockedAt: ub.unlockedAt, valueAtUnlock: ub.valueAtUnlock }])
    )

    const result = []

    for (const badge of allBadges) {
      const unlockedData = unlockedMap.get(badge.id)
      const unlocked = !!unlockedData

      let currentValue: number | null = null
      let progress = 0

      if (!unlocked) {
        // Calculer la progression
        const check = await this.checkBadgeCondition(user, badge)
        currentValue = check.currentValue

        if (badge.conditionValue && currentValue !== null) {
          progress = Math.min(100, Math.round((currentValue / badge.conditionValue) * 100))
        }
      } else {
        progress = 100
        currentValue = unlockedData.valueAtUnlock
      }

      result.push({
        badge,
        unlocked,
        unlockedAt: unlockedData?.unlockedAt || null,
        progress,
        currentValue,
        targetValue: badge.conditionValue,
      })
    }

    return result
  }
}
