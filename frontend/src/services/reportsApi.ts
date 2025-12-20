import api from './api'
import type { ReportData } from '../types/reports'

export const reportsApi = {
  getMonthlyReport: async (month: number, year: number): Promise<ReportData> => {
    const response = await api.get('/api/reports/monthly', { params: { month, year } })
    return response.data
  },

  getAnnualReport: async (year: number): Promise<ReportData> => {
    const response = await api.get('/api/reports/annual', { params: { year } })
    return response.data
  },
}
