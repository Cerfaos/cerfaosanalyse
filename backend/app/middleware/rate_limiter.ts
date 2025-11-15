import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

interface RateLimitStore {
  count: number
  resetTime: number
}

// Simple in-memory rate limiter
const store = new Map<string, RateLimitStore>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export default class RateLimiter {
  /**
   * Handle method required by AdonisJS middleware
   * @param limitType - Type of rate limit: 'upload', 'auth', or 'general'
   */
  async handle(ctx: HttpContext, next: NextFn, limitType?: string[]) {
    const type = limitType?.[0] || 'general'

    switch (type) {
      case 'handleUpload':
        return this.handleUpload(ctx, next)
      case 'handleAuth':
        return this.handleAuth(ctx, next)
      default:
        return this.handleGeneral(ctx, next)
    }
  }

  /**
   * Rate limit pour les uploads (10 requêtes par heure par utilisateur)
   */
  private async handleUpload({ auth, response }: HttpContext, next: NextFn) {
    const userId = auth.user?.id || 'anonymous'
    const key = `upload:${userId}`
    const maxRequests = 10
    const windowMs = 60 * 60 * 1000 // 1 heure

    const result = this.checkLimit(key, maxRequests, windowMs)

    if (!result.allowed) {
      return response.tooManyRequests({
        message: `Limite d'uploads atteinte. Réessayez dans ${Math.ceil(result.retryAfter / 60)} minutes.`,
        retryAfter: result.retryAfter,
      })
    }

    response.header('X-RateLimit-Limit', maxRequests.toString())
    response.header('X-RateLimit-Remaining', result.remaining.toString())
    response.header('X-RateLimit-Reset', result.resetTime.toString())

    return next()
  }

  /**
   * Rate limit pour l'authentification (5 tentatives par 15 minutes par IP)
   */
  private async handleAuth({ request, response }: HttpContext, next: NextFn) {
    const ip = request.ip() || 'unknown'
    const key = `auth:${ip}`
    const maxRequests = 5
    const windowMs = 15 * 60 * 1000 // 15 minutes

    const result = this.checkLimit(key, maxRequests, windowMs)

    if (!result.allowed) {
      return response.tooManyRequests({
        message: `Trop de tentatives. Réessayez dans ${Math.ceil(result.retryAfter / 60)} minutes.`,
        retryAfter: result.retryAfter,
      })
    }

    response.header('X-RateLimit-Limit', maxRequests.toString())
    response.header('X-RateLimit-Remaining', result.remaining.toString())
    response.header('X-RateLimit-Reset', result.resetTime.toString())

    return next()
  }

  /**
   * Rate limit général pour API (100 requêtes par minute par utilisateur)
   */
  private async handleGeneral({ auth, request, response }: HttpContext, next: NextFn) {
    const userId = auth.user?.id || request.ip() || 'anonymous'
    const key = `general:${userId}`
    const maxRequests = 100
    const windowMs = 60 * 1000 // 1 minute

    const result = this.checkLimit(key, maxRequests, windowMs)

    if (!result.allowed) {
      return response.tooManyRequests({
        message: `Trop de requêtes. Réessayez dans ${result.retryAfter} secondes.`,
        retryAfter: result.retryAfter,
      })
    }

    response.header('X-RateLimit-Limit', maxRequests.toString())
    response.header('X-RateLimit-Remaining', result.remaining.toString())
    response.header('X-RateLimit-Reset', result.resetTime.toString())

    return next()
  }

  private checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; retryAfter: number; resetTime: number } {
    const now = Date.now()
    const record = store.get(key)

    if (!record || now > record.resetTime) {
      // New window
      const newResetTime = now + windowMs
      store.set(key, { count: 1, resetTime: newResetTime })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        retryAfter: 0,
        resetTime: Math.floor(newResetTime / 1000),
      }
    }

    if (record.count >= maxRequests) {
      // Limit exceeded
      const retryAfterMs = record.resetTime - now
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil(retryAfterMs / 1000),
        resetTime: Math.floor(record.resetTime / 1000),
      }
    }

    // Increment counter
    record.count++
    store.set(key, record)

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      retryAfter: 0,
      resetTime: Math.floor(record.resetTime / 1000),
    }
  }
}
