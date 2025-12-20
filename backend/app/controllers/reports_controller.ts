import type { HttpContext } from '@adonisjs/core/http'
import ReportsService from '#services/reports_service'

export default class ReportsController {
  private reportsService: ReportsService

  constructor() {
    this.reportsService = new ReportsService()
  }

  async monthly({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const month = Number(request.input('month'))
    const year = Number(request.input('year'))

    if (!month || month < 1 || month > 12) {
      return response.badRequest({ error: 'Le mois doit être compris entre 1 et 12' })
    }

    if (!year || year < 2000 || year > 2100) {
      return response.badRequest({ error: "L'année doit être comprise entre 2000 et 2100" })
    }

    const report = await this.reportsService.generateMonthlyReport(user.id, month, year)
    return response.ok(report)
  }

  async annual({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const year = Number(request.input('year'))

    if (!year || year < 2000 || year > 2100) {
      return response.badRequest({ error: "L'année doit être comprise entre 2000 et 2100" })
    }

    const report = await this.reportsService.generateAnnualReport(user.id, year)
    return response.ok(report)
  }
}
