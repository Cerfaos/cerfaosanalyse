import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register({ request, response }: HttpContext) {
    const data = request.only(['email', 'password', 'fullName'])

    // Vérifier si l'email existe déjà
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.conflict({ message: 'Email already exists' })
    }

    const user = await User.create(data)

    // Créer un token d'accès
    const token = await User.accessTokens.create(user)

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
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

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
        },
        token: token.value!.release(),
      },
    })
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
      },
    })
  }
}
