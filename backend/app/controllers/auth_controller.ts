import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth'
import logger from '@adonisjs/core/services/logger'

export default class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    // Vérifier si l'email existe déjà
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      logger.warn({ email: data.email }, 'Tentative inscription avec email existant')
      return response.conflict({ message: 'Email already exists' })
    }

    const user = await User.create(data)

    // Créer un token d'accès
    const token = await User.accessTokens.create(user)

    logger.info({ userId: user.id, email: user.email }, 'Nouvel utilisateur inscrit')

    return response.created({
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token: token.value!.release(),
      },
    })
  }

  /**
   * Connexion utilisateur
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      logger.info({ userId: user.id, email: user.email }, 'Connexion réussie')

      return response.ok({
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            fcMax: user.fcMax,
            fcRepos: user.fcRepos,
            weightCurrent: user.weightCurrent,
            theme: user.theme,
            avatarUrl: user.avatarUrl,
          },
          token: token.value!.release(),
        },
      })
    } catch (error) {
      const email = request.input('email', 'unknown')
      logger.warn({ email, error: (error as Error).message }, 'Échec de connexion')
      throw error
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken

    if (token) {
      await User.accessTokens.delete(user, token.identifier)
    }

    logger.info({ userId: user.id }, 'Déconnexion')

    return response.ok({ message: 'Logged out successfully' })
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    return response.ok({
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
}
